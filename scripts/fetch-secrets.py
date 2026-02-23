#!/usr/bin/env python3
"""Fetch all secrets from GCP Secret Manager and print as KEY=VALUE pairs for sourcing."""
import json, base64, urllib.request, urllib.error, sys
from concurrent.futures import ThreadPoolExecutor, as_completed

PROJECT = "gen-lang-client-0700091131"
API_BASE = f"https://secretmanager.googleapis.com/v1/projects/{PROJECT}"

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
    "AGENTMANIFESTO_USERNAME", "AGENTMANIFESTO_ACCESS_TOKEN", "AGENTMANIFESTO_ACCESS_TOKEN_SECRET", "AGENTMANIFESTO_API_KEY", "AGENTMANIFESTO_API_KEY_SECRET", "AGENTMANIFESTO_BEARER_TOKEN", "AGENTMANIFESTO_CLIENT_SECRET_ID", "AGENTMANIFESTO_CLIENT_SECRET", "AGENTMANIFESTO_FARCASTER_WALLET_ADDRESS", "AGENTMANIFESTO_FARCASTER_PRIVATE_KEY",
    "TALENT_API_KEY", "TREASURY_WALLET",
    "X_ACCESS_TOKEN", "X_ACCESS_TOKEN_SECRET", "X_BEARER_TOKEN", "X_CONSUMER_KEY",
    "X_CONSUMER_SECRET", "X_USERNAME", "X_USER_ID", "X402_NETWORK", "X402_PORT",
    "FARCASTER_FID", "FARCASTER_FNAME", "FARCASTER_CUSTODY_ADDRESS", "FARCASTER_SIGNER_PUBLIC_KEY",
    "FARCASTER_LEGACY_FID", "FARCASTER_LEGACY_CUSTODY_ADDRESS", "FARCASTER_LEGACY_SIGNER_PUBLIC_KEY",
    "BANKR_API_KEY", "BANKR_API_URL", "AGENT0_AGENT_ID", "ONCHAIN_API_KEY",
]

def get_token():
    url = "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token"
    req = urllib.request.Request(url, headers={"Metadata-Flavor": "Google"})
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read())["access_token"]

def fetch_secret(name, token):
    url = f"{API_BASE}/secrets/{name}/versions/latest:access"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            d = json.loads(r.read())
            return name, base64.b64decode(d["payload"]["data"]).decode()
    except Exception as e:
        return name, None

token = get_token()
results = {}

with ThreadPoolExecutor(max_workers=10) as pool:
    futures = {pool.submit(fetch_secret, k, token): k for k in KEYS}
    for f in as_completed(futures):
        name, val = f.result()
        results[name] = val

# Output as shell-safe exports
for k in KEYS:
    val = results.get(k) or ""
    # Escape single quotes in value
    escaped = val.replace("'", "'\\''")
    print(f"export {k}='{escaped}'")
