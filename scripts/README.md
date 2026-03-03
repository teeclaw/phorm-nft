# Scripts

Core automation scripts for Mr. Tee's infrastructure.

## Credential Management

### fetch-secrets.py

**Purpose:** Fetch all secrets from GCP Secret Manager and output as shell exports.

**Security Features:**
- ✅ **Encrypted caching** (Fernet/AES-128-CBC + HMAC)
- ✅ Machine-specific encryption keys (derived from `/etc/machine-id` + username)
- ✅ 1-hour cache TTL
- ✅ Retry logic with exponential backoff
- ✅ Critical secret validation
- ✅ Thread-safe parallel fetching

**Cache Location:** `~/.openclaw/.cache/secrets/*.enc`

**Usage:**
```bash
# Normal use (via wrapper script)
eval "$(bash scripts/fetch-secrets.sh)"

# Debug mode
DEBUG=1 bash scripts/fetch-secrets.sh

# Direct Python call
eval "$(python3 scripts/fetch-secrets.py)"
```

**Dependencies:**
- `cryptography` Python package (for Fernet encryption)
- GCP metadata server access (for service account token)

**Security Note:** Cache files are encrypted at rest using a machine-specific key derived from hardware/OS identifiers. This prevents plaintext credential exposure if the filesystem is compromised. Each user on the system has isolated encrypted caches.

**Upgrade from v1 (March 3, 2026):**
- Previous version cached secrets in plaintext (security vulnerability)
- New version encrypts all cached secrets with Fernet
- Old `.cache` files automatically cleaned on first run
- Backward compatible: falls back to plaintext if `cryptography` unavailable

## Other Scripts

### kms-signer.mjs
Ethereum transaction signing using GCP Cloud KMS HSM.

### swap-usdc-eth-uniswap.mjs
Uniswap V3 swaps with KMS signing.

### news-aggregator.mjs
Multi-source news aggregation for social content.

### rotate-secrets.sh
Semi-automated secret rotation workflow.

---

**Last Updated:** March 3, 2026  
**Maintainer:** TeeCode (CTO)
