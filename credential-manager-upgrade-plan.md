# Credential Manager Upgrade Plan

**Created:** 2026-02-11
**Status:** Planned
**Priority:** High (security foundation)

---

## Phase 1: Critical Fixes (Do Now)

### 1.1 Fix Permissions Immediately
```bash
chmod 600 ~/.openclaw/farcaster-credentials.json
chmod -R 600 ~/.openclaw/backups/credentials-old-*/*
chmod 700 ~/.openclaw/backups/ ~/.openclaw/backups/*/
```
**Effort:** 5 min | **Risk:** None

### 1.2 Fix Backup Permissions in consolidate.py
- After `shutil.copy2()`, add `os.chmod(backup_path, 0o600)`
- After `backup_dir.mkdir()`, add `os.chmod(backup_dir, 0o700)`
- Ensures all future backups are created secure by default

**Effort:** 10 min | **Risk:** None

### 1.3 Fix validate.py Quote Contradiction
- Current bug: flags "spaces need quotes" → you quote → flags "quotes not needed"
- **Fix:** Allow double-quoted values with spaces. Only flag unquoted values containing spaces.
- Remove the "Quotes not needed" check entirely — quotes in .env are valid

**Effort:** 15 min | **Risk:** None

---

## Phase 2: Scanner Improvements (This Week)

### 2.1 Expand Scan Patterns
Add missing locations to `CREDENTIAL_PATTERNS`:
```python
"~/.openclaw/*.json",              # farcaster-credentials.json etc.
"~/.openclaw/*-credentials*",      # any credentials file in .openclaw root
"~/.openclaw/workspace/*/.env",    # workspace subdirectory .env files
"~/.openclaw/workspace/*/repo/.env",
```
**Effort:** 15 min

### 2.2 Detect Symlinked .env Files
- Currently ignores symlinks (x402-server/.env → main .env)
- Add symlink detection: if target is the main .env, mark as OK
- If target is elsewhere, flag as potential issue

**Effort:** 20 min

### 2.3 Scan for Hardcoded Credentials in Scripts
Add optional deep scan mode:
```bash
./scripts/scan.py --deep
```
- Grep through `.sh`, `.js`, `.py` files for hardcoded API keys/secrets
- Pattern match: strings that look like API keys (high entropy, common prefixes like `sk_`, `pk_`, `Bearer`)
- Exclude node_modules, .git

**Effort:** 1 hour

---

## Phase 3: GPG Encryption for High-Value Secrets (This Week)

### 3.1 Create `encrypt.py` Script
```bash
./scripts/encrypt.py --keys MAIN_WALLET_PRIVATE_KEY,FARCASTER_CUSTODY_PRIVATE_KEY,FARCASTER_SIGNER_PRIVATE_KEY
```
**What it does:**
1. Extract specified keys from `.env`
2. Store them in `~/.openclaw/.env.secrets` (GPG encrypted)
3. Replace values in `.env` with `GPG:key_name` placeholder
4. Set permissions on `.env.secrets.gpg` to 600

### 3.2 Create `decrypt.py` / Update `enforce.py`
```python
def get_credential(key):
    value = load_from_env(key)
    if value.startswith("GPG:"):
        return decrypt_from_gpg(key)
    return value
```
- Transparent to calling code — `get_credential()` handles both plaintext and GPG
- GPG passphrase cached by gpg-agent (configurable TTL)

### 3.3 Create `setup-gpg.sh`
- Check if GPG is installed
- Generate a dedicated OpenClaw GPG key if none exists
- Configure gpg-agent cache timeout (e.g., 8 hours)
- Test encrypt/decrypt cycle

### 3.4 Update Loader Scripts
- `load_credentials.py` — add GPG fallback
- `load_credentials.sh` — add GPG fallback
- `enforce.py` — validate GPG setup for encrypted keys

**Effort:** 3 hours total

---

## Phase 4: Improved Security Checks (Next Week)

### 4.1 Upgrade `check_security()` in validate.py
Replace naive checks with:
- **Entropy analysis** — flag suspiciously low-entropy values for secret keys
- **Known weak patterns** — expand beyond "password123" to common defaults
- **Private key detection** — flag any value starting with `0x` + 64 hex chars
- **Mnemonic detection** — flag values that look like 12/24 word seed phrases
- **Key length validation** — warn if API keys are unusually short/long for their service

**Effort:** 2 hours

### 4.2 Add Credential Rotation Tracking
New file: `~/.openclaw/.env.meta`
```json
{
  "MAIN_WALLET_PRIVATE_KEY": {
    "created": "2026-01-15",
    "lastRotated": null,
    "rotationDays": 90,
    "risk": "critical"
  },
  "MOLTBOOK_API_KEY": {
    "created": "2026-02-04",
    "lastRotated": null,
    "rotationDays": 180,
    "risk": "low"
  }
}
```
New script: `./scripts/rotation-check.py`
- Warns when keys are past rotation date
- Can be added to HEARTBEAT.md for periodic checks
- Risk levels: critical (30d), standard (90d), low (180d)

**Effort:** 2 hours

### 4.3 Consolidate farcaster-credentials.json
- Migrate Farcaster private keys into GPG-encrypted storage
- Update all scripts that reference `farcaster-credentials.json`:
  - `blankspace-phase2.js`
  - `farcaster-agent/repo/src/credentials.js`
  - `social-post/scripts/check-balance.sh`
  - `social-post/lib/farcaster.sh`
- Replace direct file reads with `get_credential()` calls
- Delete the plaintext JSON file after migration

**Effort:** 2 hours

---

## Phase 5: Hardening (Later)

### 5.1 Pre-commit Hook
- Install git hook that scans staged files for credentials
- Blocks commits containing API keys, private keys, secrets
- Uses same patterns as scan.py

### 5.2 Access Logging
```bash
# Log all .env reads
echo "$(date): .env accessed by $0 (pid $$)" >> ~/.openclaw/credential-access.log
```
- Add to enforce.py and loader scripts
- Useful for auditing which processes access credentials

### 5.3 Emergency Rotation Script
```bash
./scripts/emergency-rotate.py --service moltbook
```
- Revoke old key via service API (where supported)
- Generate new key
- Update .env automatically
- Test connectivity
- Log rotation event

---

## Summary

| Phase | Focus | Effort | Priority |
|-------|-------|--------|----------|
| 1 | Permission fixes + validate.py bug | 30 min | 🔴 Critical |
| 2 | Scanner blind spots | 1.5 hours | 🟡 High |
| 3 | GPG encryption for private keys | 3 hours | 🟡 High |
| 4 | Security checks + rotation + farcaster migration | 6 hours | 🟡 Medium |
| 5 | Hardening (hooks, logging, emergency) | 4 hours | 🟢 Later |

**Total estimated effort:** ~15 hours

---

## Files to Create/Modify

**New scripts:**
- `scripts/encrypt.py` — GPG encrypt high-value keys
- `scripts/decrypt.py` — GPG decrypt (called by enforce.py)
- `scripts/setup-gpg.sh` — GPG setup helper
- `scripts/rotation-check.py` — Key rotation tracker

**Modified scripts:**
- `scripts/scan.py` — Expanded patterns, deep scan mode
- `scripts/consolidate.py` — Secure backup permissions
- `scripts/validate.py` — Fix quote bug, better security checks
- `scripts/enforce.py` — GPG-aware credential loading

**New files:**
- `~/.openclaw/.env.secrets.gpg` — Encrypted high-value keys
- `~/.openclaw/.env.meta` — Rotation metadata
