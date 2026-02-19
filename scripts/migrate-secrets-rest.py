#!/usr/bin/env python3
"""Migrate secrets from .env to GCP Secret Manager using REST API (no gcloud dependency)"""
import json, re, sys, urllib.request, urllib.error, base64
from pathlib import Path

PROJECT = "gen-lang-client-0700091131"
ENV_PATH = Path.home() / ".openclaw/.env"
API_BASE = f"https://secretmanager.googleapis.com/v1/projects/{PROJECT}"

SKIP_PREFIXES = ("LC_", "XDG_", "DBUS_", "BASH")
SKIP_EXACT = {"PATH","HOME","USER","SHELL","TERM","LANG","LOGNAME","MAIL",
              "OLDPWD","SHLVL","LESSOPEN","LS_COLORS","_"}
GPG_KEYS = {
    "AGENT_WALLET_PRIVATE_KEY",
    "FARCASTER_CUSTODY_PRIVATE_KEY",
    "FARCASTER_SIGNER_PRIVATE_KEY",
    "FARCASTER_LEGACY_CUSTODY_PRIVATE_KEY",
    "FARCASTER_LEGACY_SIGNER_PRIVATE_KEY",
}

def skip_key(k):
    if k in SKIP_EXACT: return True
    if k in GPG_KEYS: return True
    for p in SKIP_PREFIXES:
        if k.startswith(p): return True
    return False

def get_token():
    url = "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token"
    req = urllib.request.Request(url, headers={"Metadata-Flavor": "Google"})
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read())["access_token"]

def api_request(method, url, body=None, token=None):
    data = json.dumps(body).encode() if body else None
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

def create_secret(name, token):
    url = f"{API_BASE}/secrets?secretId={name}"
    body = {"replication": {"automatic": {}}}
    status, resp = api_request("POST", url, body, token)
    return status, resp

def add_version(name, value, token):
    url = f"{API_BASE}/secrets/{name}:addVersion"
    encoded = base64.b64encode(value.encode()).decode()
    body = {"payload": {"data": encoded}}
    status, resp = api_request("POST", url, body, token)
    return status, resp

# Parse .env
secrets = {}
for line in ENV_PATH.read_text().splitlines():
    line = line.strip()
    if not line or line.startswith("#"): continue
    if "=$(" in line: continue
    m = re.match(r'^([A-Za-z_][A-Za-z0-9_]*)=(.*)', line)
    if not m: continue
    key, val = m.group(1), m.group(2)
    if skip_key(key): continue
    if val.startswith("GPG:"): continue
    if (val.startswith('"') and val.endswith('"')) or \
       (val.startswith("'") and val.endswith("'")):
        val = val[1:-1]
    secrets[key] = val

print(f"[INFO] Found {len(secrets)} secrets to migrate")
token = get_token()
print(f"[INFO] Auth token obtained")

migrated = []
failed = []

for key, val in secrets.items():
    # Create secret (ignore 409 Already Exists)
    status, resp = create_secret(key, token)
    if status == 200:
        pass  # created
    elif status == 409:
        pass  # already exists, fine
    else:
        print(f"[FAIL] Create {key}: HTTP {status} — {resp.get('error',{}).get('message','unknown')}")
        failed.append(key)
        continue

    # Add version
    status, resp = add_version(key, val, token)
    if status == 200:
        print(f"[OK]   {key}")
        migrated.append(key)
    else:
        print(f"[FAIL] Version {key}: HTTP {status} — {resp.get('error',{}).get('message','unknown')}")
        failed.append(key)

print(f"\n[SUMMARY] Migrated: {len(migrated)}  Failed: {len(failed)}")
if failed:
    print(f"[FAILED KEYS] {', '.join(failed)}")

# Write fetch-secrets.sh using REST API (no gcloud)
fetch_path = Path("/home/phan_harry/.openclaw/workspace/scripts/fetch-secrets.sh")
lines = [
    "#!/bin/bash",
    "# Auto-generated: fetch all secrets from GCP Secret Manager via REST API",
    f'PROJECT="{PROJECT}"',
    "",
    "# Get auth token from metadata server",
    'TOKEN=$(curl -sf -H "Metadata-Flavor: Google" \\',
    '  "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token" \\',
    '  | python3 -c \'import sys,json; print(json.load(sys.stdin)["access_token"])\')',
    "",
    "fetch_secret() {",
    "  local name=$1",
    '  curl -sf -H "Authorization: Bearer $TOKEN" \\',
    f'    "https://secretmanager.googleapis.com/v1/projects/{PROJECT}/secrets/${{name}}/versions/latest:access" \\',
    "    | python3 -c 'import sys,json,base64; d=json.load(sys.stdin); print(base64.b64decode(d[\"payload\"][\"data\"]).decode())'",
    "}",
    "",
    "# Export all secrets",
]
for k in migrated:
    lines.append(f'export {k}=$(fetch_secret {k})')

fetch_path.write_text("\n".join(lines) + "\n")
fetch_path.chmod(0o755)
print(f"\n[INFO] fetch-secrets.sh written with {len(migrated)} exports")
