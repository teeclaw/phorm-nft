#!/usr/bin/env python3
"""Migrate secrets from .env to GCP Secret Manager using gcloud CLI"""
import json, re, subprocess, base64
from pathlib import Path

PROJECT = "856733517998"
ENV_PATH = Path.home() / ".openclaw/.env"

SKIP_PREFIXES = ("LC_", "XDG_", "DBUS_", "BASH")
SKIP_EXACT = {"PATH","HOME","USER","SHELL","TERM","LANG","LOGNAME","MAIL",
              "OLDPWD","SHLVL","LESSOPEN","LS_COLORS","_"}

def skip_key(k):
    if k in SKIP_EXACT: return True
    for p in SKIP_PREFIXES:
        if k.startswith(p): return True
    return False

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    return r.returncode, r.stdout.strip(), r.stderr.strip()

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

migrated = []
failed = []

for key, val in secrets.items():
    # Create secret (ignore error if already exists)
    code, out, err = run([
        "gcloud", "secrets", "create", key,
        "--replication-policy=automatic",
        f"--project={PROJECT}"
    ])
    if code not in (0,) and "already exists" not in err:
        print(f"[FAIL] Create {key}: {err}")
        failed.append(key)
        continue

    # Add secret version
    proc = subprocess.run(
        ["gcloud", "secrets", "versions", "add", key,
         "--data-file=-", f"--project={PROJECT}"],
        input=val, capture_output=True, text=True
    )
    if proc.returncode == 0:
        print(f"[OK]   {key}")
        migrated.append(key)
    else:
        print(f"[FAIL] Version {key}: {proc.stderr.strip()}")
        failed.append(key)

print(f"\n[SUMMARY] Migrated: {len(migrated)}  Failed: {len(failed)}")
if failed:
    print(f"[FAILED KEYS] {failed}")

# Write fetch script
fetch_script_path = Path("/home/phan_harry/.openclaw/workspace/scripts/fetch-secrets.sh")
lines = [
    "#!/bin/bash",
    "# Fetch all secrets from GCP Secret Manager",
    f'PROJECT="{PROJECT}"',
    "",
    "fetch_secret() {",
    "  local name=$1",
    f'  gcloud secrets versions access latest --secret="$name" --project=$PROJECT 2>/dev/null',
    "}",
    "",
    "# Export all secrets",
]
for k in migrated:
    lines.append(f'export {k}=$(fetch_secret {k})')

fetch_script_path.write_text("\n".join(lines) + "\n")
fetch_script_path.chmod(0o755)
print(f"\n[INFO] fetch-secrets.sh written with {len(migrated)} exports")
print(f"MIGRATED_KEYS={json.dumps(migrated)}")
