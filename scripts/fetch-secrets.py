#!/usr/bin/env python3
"""Fetch all secrets from GCP Secret Manager and print as KEY=VALUE pairs for sourcing.

Improvements:
- Caching layer (1h TTL) to reduce GCP API calls
- Error logging to stderr (doesn't interfere with export output)
- Retry logic with exponential backoff
- Validation for critical secrets
- Optional debug metrics via DEBUG=1 env var
"""
import json, base64, urllib.request, urllib.error, sys, os, time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

PROJECT = "gen-lang-client-0700091131"
API_BASE = f"https://secretmanager.googleapis.com/v1/projects/{PROJECT}"
CACHE_DIR = Path.home() / ".openclaw" / ".cache" / "secrets"
CACHE_TTL = 3600  # 1 hour

KEYS = [
    "AGENT_NAME", "CLAUDE_CODE_OAUTH_TOKEN", "BOTCHAN_AGENT_NAME", "BOTCHAN_API_KEY",
    "BRAVE_API_KEY", "CDP_API_KEY_ID", "CDP_API_KEY_SECRET", "CLAIM_ID",
    "CLAWHUB_ACCOUNT", "CLAWHUB_TOKEN", "FOURCLAW_AGENT_NAME", "FOURCLAW_API_KEY",
    "AGENT_WALLET_ADDRESS", "MOLTBOOK_AGENT_ID", "MOLTBOOK_AGENT_NAME", "MOLTBOOK_API_KEY",
    "MOLTBOOK_CLAIMED", "MOLTBOOK_CLAIMED_AT", "MOLTBOOK_KARMA", "MOLTBOOK_PROFILE_URL",
    "MOLTBOOK_REGISTERED_AT", "MOLTBOOK_STATS", "MOLTBOOK_VERIFICATION_CODE",
    "MOLTEN_AGENT_ID", "MOLTEN_AGENT_NAME", "MOLTEN_API_KEY", "MOONSHOT_API_KEY",
    "NEYNAR_API_KEY", "OPENROUTER_API_KEY", "NETWORK",
    "OXDASX_ACCESS_TOKEN", "OXDASX_ACCESS_TOKEN_SECRET", "OXDASX_API_KEY", "OXDASX_API_KEY_SECRET",
    "CRYPTOCLARITY_USERNAME", "CRYPTOCLARITY_ACCOUNT", "CRYPTOCLARITY_ACCESS_TOKEN", "CRYPTOCLARITY_ACCESS_TOKEN_SECRET", "CRYPTOCLARITY_API_KEY", "CRYPTOCLARITY_API_KEY_SECRET", "CRYPTOCLARITY_BEARER_TOKEN", "CRYPTOCLARITY_CLIENT_SECRET_ID",
    "AGENTMANIFESTO_USERNAME", "AGENTMANIFESTO_ACCESS_TOKEN", "AGENTMANIFESTO_ACCESS_TOKEN_SECRET", "AGENTMANIFESTO_API_KEY", "AGENTMANIFESTO_API_KEY_SECRET", "AGENTMANIFESTO_BEARER_TOKEN", "AGENTMANIFESTO_CLIENT_SECRET_ID", "AGENTMANIFESTO_CLIENT_SECRET",
    "TALENT_API_KEY", "TREASURY_WALLET",
    "X_ACCESS_TOKEN", "X_ACCESS_TOKEN_SECRET", "X_BEARER_TOKEN", "X_CONSUMER_KEY",
    "X_CONSUMER_SECRET", "X_USERNAME", "X_USER_ID", "X402_NETWORK", "X402_PORT",
    "FARCASTER_FID", "FARCASTER_FNAME", "FARCASTER_CUSTODY_ADDRESS", "FARCASTER_SIGNER_PUBLIC_KEY",
    "FARCASTER_LEGACY_FID", "FARCASTER_LEGACY_CUSTODY_ADDRESS", "FARCASTER_LEGACY_SIGNER_PUBLIC_KEY",
    "BANKR_API_KEY", "BANKR_API_URL", "AGENT0_AGENT_ID", "ONCHAIN_API_KEY",
    "NOOKPLOT_API_KEY", "NOOKPLOT_AGENT_PRIVATE_KEY", "NOOKPLOT_AGENT_ADDRESS", "NOOKPLOT_GATEWAY_URL",
    "GEMINI_API_KEY",
]

# Critical secrets that must exist
CRITICAL_KEYS = ["AGENT_NAME", "X_BEARER_TOKEN", "NEYNAR_API_KEY", "AGENT_WALLET_ADDRESS"]

DEBUG = os.getenv("DEBUG") == "1"

def log(msg):
    """Log to stderr to not interfere with export output"""
    print(f"[fetch-secrets] {msg}", file=sys.stderr)

def get_cache_path(name):
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    return CACHE_DIR / f"{name}.cache"

def read_cache(name):
    """Read from cache if fresh (within TTL)"""
    path = get_cache_path(name)
    if not path.exists():
        return None
    
    mtime = path.stat().st_mtime
    if time.time() - mtime > CACHE_TTL:
        if DEBUG:
            log(f"Cache expired for {name}")
        return None
    
    try:
        return path.read_text().strip()
    except Exception as e:
        if DEBUG:
            log(f"Cache read error for {name}: {e}")
        return None

def write_cache(name, value):
    """Write value to cache"""
    try:
        get_cache_path(name).write_text(value)
    except Exception as e:
        if DEBUG:
            log(f"Cache write error for {name}: {e}")

def get_token():
    url = "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token"
    req = urllib.request.Request(url, headers={"Metadata-Flavor": "Google"})
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read())["access_token"]

def fetch_secret(name, token, retries=3):
    """Fetch secret with retry logic and caching"""
    # Check cache first
    cached = read_cache(name)
    if cached is not None:
        if DEBUG:
            log(f"Cache hit: {name}")
        return name, cached
    
    url = f"{API_BASE}/secrets/{name}/versions/latest:access"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                d = json.loads(r.read())
                value = base64.b64decode(d["payload"]["data"]).decode()
                write_cache(name, value)
                if DEBUG:
                    log(f"Fetched: {name}")
                return name, value
        except urllib.error.HTTPError as e:
            if e.code == 404:
                log(f"Secret not found: {name}")
                return name, None
            elif attempt < retries - 1:
                wait = 2 ** attempt
                if DEBUG:
                    log(f"Retry {attempt+1}/{retries} for {name} after {wait}s (HTTP {e.code})")
                time.sleep(wait)
            else:
                log(f"Failed to fetch {name} after {retries} attempts: HTTP {e.code}")
                return name, None
        except Exception as e:
            if attempt < retries - 1:
                wait = 2 ** attempt
                if DEBUG:
                    log(f"Retry {attempt+1}/{retries} for {name} after {wait}s ({e})")
                time.sleep(wait)
            else:
                log(f"Failed to fetch {name} after {retries} attempts: {e}")
                return name, None
    
    return name, None

start = time.time()
token = get_token()
results = {}
failed = []
cache_hits = 0

# Check cache status before fetching
for k in KEYS:
    if read_cache(k) is not None:
        cache_hits += 1

with ThreadPoolExecutor(max_workers=10) as pool:
    futures = {pool.submit(fetch_secret, k, token): k for k in KEYS}
    for f in as_completed(futures):
        name, val = f.result()
        results[name] = val
        if val is None:
            failed.append(name)

# Validate critical secrets
missing_critical = [k for k in CRITICAL_KEYS if not results.get(k)]
if missing_critical:
    log(f"WARNING: Missing critical secrets: {', '.join(missing_critical)}")

if DEBUG:
    elapsed = time.time() - start
    log(f"Fetched {len(KEYS)} secrets in {elapsed:.2f}s ({cache_hits} from cache, {len(failed)} failed)")

if failed and DEBUG:
    log(f"Failed to fetch: {', '.join(failed)}")

# Output as shell-safe exports
for k in KEYS:
    val = results.get(k) or ""
    # Escape single quotes in value
    escaped = val.replace("'", "'\\''")
    print(f"export {k}='{escaped}'")
