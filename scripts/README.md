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

## Research & Intelligence

### news-aggregator.mjs

Resilient news aggregation from multiple crypto/tech sources with automatic fallback.

**Usage:**
```bash
# Get top 20 news items (text format)
node scripts/news-aggregator.mjs

# Get top 5 items
node scripts/news-aggregator.mjs --limit 5

# Get JSON output for programmatic use
node scripts/news-aggregator.mjs --limit 10 --format json
```

**Features:**
- **Multi-Source:** HackerNews (Algolia), Decrypt, Cointelegraph, CoinDesk
- **Automatic Fallback:** Works even if some sources fail
- **Deduplication:** Removes duplicate URLs across sources
- **Sorted:** By timestamp (newest first), then by score
- **Fast:** Parallel fetching with 10-15s timeouts
- **Resilient:** Succeeds if any source works (no single point of failure)

**Output Formats:**
- `text` - Human-readable format with source status
- `json` - Structured data with full metadata

**Source Status:**
Each run shows which sources succeeded/failed:
```
✅ HackerNews: 10 items (249ms)
✅ Decrypt: 10 items (114ms)
❌ CoinDesk: failed: HTTP 308
✅ Cointelegraph: 10 items (192ms)
```

**Exit Code:** Returns 1 if all sources fail, 0 otherwise.

## Maintenance

- **decrypt-key.sh** - GPG key decryption helper
- **rotate-secrets.sh** - Secret rotation workflow
- **migrate-secrets*.py** - GCP Secret Manager migration tools
