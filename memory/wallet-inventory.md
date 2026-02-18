# Wallet Inventory - Active Wallets

Last updated: 2026-02-07 04:09 UTC

## Active Wallets

### 1. Your Main Wallet (Now Farcaster Account!)
- **Address:** `0x112F14D7aB03111Fdf720c6Ccc720A21576F7487`
- **Purpose:** Primary wallet + Farcaster custody (FID: 2700953)
- **Credentials:** 
  - Private key: `/home/phan_harry/.openclaw/.env` (AGENT_WALLET_PRIVATE_KEY)
  - Farcaster: `/home/phan_harry/.openclaw/farcaster-credentials.json`
- **Status:** ✅ Active, Farcaster-enabled
- **Balances:**
  - Ethereum: 0.0007 ETH
  - Optimism: 0.0008 ETH
  - Base: 0.016 ETH + 2.05 USDC
- **Farcaster:**
  - FID: 2700953
  - Registered: 2026-02-07
  - First cast: https://farcaster.xyz/~/conversations/0xaec7395315d3f382352b8471dcfe73b1aea11c28
  - Active: ✅

### 2. Old Farcaster Custody Wallet (@teeclaw)
- **Address:** `0xB3297706A7F0F2e0DedBc68bdB88a8c1247719e1`
- **Purpose:** First Farcaster account (FID: 2684290, @teeclaw)
- **Credentials:** `/home/phan_harry/.openclaw/farcaster-credentials.json`
- **Status:** ⚠️ Inactive (no mnemonic for mobile access)
- **Contains:**
  - ETH: 0.00003 ETH (Optimism)
  - ETH: 0.000018 ETH (Base)
- **Note:** Lost mnemonic - can't import to Warpcast mobile

## Removed Wallets

### AGENT_WALLET (Removed 2026-02-06)
- **Address:** `0x56937dFB228F4c0CC869C1C3E8724a6027587BB9`
- **Reason:** Auto-generated during moltbook.space setup attempt
- **Status:** Empty, never funded, removed from .env
- **Action Taken:** Deleted mnemonic, private key, and address from .env

## Notes

- Farcaster credentials are the ONLY wallet currently managed by Mr. Tee
- All Farcaster posts use custody wallet 0xB329...
- Check balances: `scripts/check-balance.sh` (in social-post skill)
