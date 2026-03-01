# Workspace Scripts

Utility scripts for credential management, blockchain operations, and automation.

## Secret Management

### fetch-secrets.sh / fetch-secrets.py

Fetches all secrets from GCP Secret Manager and exports them to the environment.

**Usage:**
```bash
# Standard usage (quiet mode)
eval "$(bash scripts/fetch-secrets.sh)"

# Debug mode (shows timing and cache stats)
DEBUG=1 eval "$(bash scripts/fetch-secrets.sh)"
```

**Features:**
- **Caching:** Secrets are cached for 1 hour in `~/.openclaw/.cache/secrets/`
- **Retry Logic:** Exponential backoff on network failures (3 attempts)
- **Error Logging:** Missing/failed secrets logged to stderr (doesn't break export)
- **Validation:** Warns if critical secrets are missing
- **Performance:** ~0.5s with cache vs ~5-10s without

**Cache Location:** `~/.openclaw/.cache/secrets/*.cache`

**Force Refresh:**
```bash
# Clear cache to force fresh fetch
rm -rf ~/.openclaw/.cache/secrets/
```

## KMS & Blockchain

- **kms-signer.mjs** - Ethers.js v6 KmsSigner for GCP Cloud KMS
- **register-8004.mjs** - Register agent on ERC-8004 identity registry
- **swap-usdc-eth-kms.mjs** - Swap USDC to ETH using KMS wallet
- **swap-usdc-eth-uniswap.mjs** - Uniswap integration for swaps

## Domain & Identity

- **conway-*.mjs** - Conway Domains registration scripts
- **gen-wallet.js** / **generate-wallet.js** - Wallet generation utilities

## Maintenance

- **decrypt-key.sh** - GPG key decryption helper
- **rotate-secrets.sh** - Secret rotation workflow
- **migrate-secrets*.py** - GCP Secret Manager migration tools
