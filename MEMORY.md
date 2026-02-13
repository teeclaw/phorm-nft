# MEMORY.md — Long-Term Memory

## Core Identity & Infrastructure

**Primary Wallet:** 0x134820820d4f631ff949625189950bA7B3C57e41 (Base mainnet)  
**ENS:** teeclaw.eth  
**ERC-8004 Agent ID:** 14482 (Base) 🔒 PRIMARY — never change without owner approval

**A2A Protocol:**
- Endpoint: https://a2a.teeclaw.xyz/a2a (ERC-8004 compliant)
- Message queue: processed every 2h
- Reputation services:
  - `/reputation/simple-report` - Free basic check (Ethos, Farcaster, Talent Protocol)
  - `/reputation/full-report` - $2 USDC comprehensive analysis + narrative

## Security

**Credentials:** All centralized in `~/.openclaw/.env` (mode 600) — 57 keys total  
**GPG:** 5 high-value private keys encrypted with symmetric AES256  
**GPG Passphrase:** `OPENCLAW_GPG_PASSPHRASE` in `.env`  
**GPG Secrets File:** `~/.openclaw/.env.secrets.gpg` (JSON format)  
**Management:** credential-manager skill (locked, production-stable)

### GPG Decryption Pattern (Standard)
```bash
# Decrypt and extract a key
source ~/.openclaw/.env
gpg --batch --decrypt --passphrase "$OPENCLAW_GPG_PASSPHRASE" \
  ~/.openclaw/.env.secrets.gpg 2>/dev/null | jq -r '.MAIN_WALLET_PRIVATE_KEY'
```

**Keys in secrets.gpg:**
- `MAIN_WALLET_PRIVATE_KEY` - Primary wallet (0x1348...7e41)
- `FARCASTER_CUSTODY_PRIVATE_KEY` - FID 2700953 custody
- `FARCASTER_SIGNER_PRIVATE_KEY` - FID 2700953 signer
- `FARCASTER_LEGACY_CUSTODY_PRIVATE_KEY` - FID 2684290 custody
- `FARCASTER_LEGACY_SIGNER_PRIVATE_KEY` - FID 2684290 signer

## Social Platforms

**Farcaster:**
- Active: FID 2700953 (@mr-teeclaw), prefix `FARCASTER_`
- Legacy: FID 2684290 (@teeclaw), prefix `FARCASTER_LEGACY_`
- Both configured in .env with GPG decryption support

**Molten.gg:**
- Agent ID: b3f0cfe2-ceea-4ba8-8d11-528de84cd8ae
- Reputation endpoint offer: Intent ID `2d9005c1-22d9-434a-ba17-efb9184b6351`

## Skills

### Locked (Production-Stable)
- **credential-manager:** Security foundation — 57 credentials, GPG encryption, rotation tracking
- **a2a-endpoint:** A2A messaging protocol — live endpoint, reputation services, 2h queue
- **openclaw-basecred-sdk:** Reputation checker — fully functional
  - **v1.0.2:** Check human reputation via Ethos Network, Talent Protocol, and Farcaster
  - Data sources: Ethos (social credibility, vouches, reviews), Talent (builder/creator scores), Farcaster (account quality)
  - Returns: Availability status, raw scores, semantic levels (Novice→Master, Emerging→Elite), recency buckets
  - Usage: `./scripts/check-reputation.mjs <address> [--full|--human|--json]`
  - Graceful degradation: Works with partial API key coverage (Ethos needs no key)
  - Security: Hardcoded credential loading from `~/.openclaw/.env`, no directory traversal
  - Design philosophy: Reports data without judgment — no rankings, no trust verdicts
  - Integrated into A2A endpoint as reputation service (free simple / $2 USDC full report)
- **social-post:** Twitter + Farcaster posting — v1.5.1 + fetch-tweet.sh
- **openclaw-8004:** Fully on-chain ERC-8004 agent management with Telegram inline buttons — viem + ERC-721 standard
  - **v1.0.0 (2026-02-13):** Telegram inline button control panel
  - Architecture: viem + ERC-721 standard (ownerOf, tokenURI), no custom contract functions
  - Interactive buttons: agent info, profile viewer, quick links to BaseScan and 8004agents.ai
  - Simplified approach: uses guaranteed ERC-721 functions, links to external tools for complex data
  - **Trigger:** Say "8004" or "erc-8004" → sends interactive panel
  - **Scripts:** `send-panel.js` (Telegram Bot API), `handle-command.js` (callback router)
  - **Functions:** Agent info, view profile, payment wallet (placeholder), active status (placeholder)
  - **Repository:** Local workspace skill (not published yet)
- **bankr:** Agent API integration — auto-executes trades, queries, token launches. Tested 2026-02-13. Multi-chain (Base/ETH/Polygon/Unichain/Solana)
- **based-dao-skill:** BASED DAO NFT auction bidding — check auctions, place bids, vote on proposals. Production-tested 2026-02-13 (auction #916, 0.00132 ETH bid)
  - **v1.1.0 (2026-02-13):** Telegram inline button control panel
  - Trigger: say "based dao" → sends interactive panel with persistent buttons
  - Scripts: `send-panel.js` (Telegram Bot API + InlineKeyboardMarkup), `handle-command.js` (callback router), `show-buttons.js` (button config)
  - Buttons: Check Auction, Quick Bid 0.001Ξ, Active Proposals, All Proposals, Refresh Panel
  - Callbacks route to `/based_check`, `/based_bid`, `/based_proposals`, etc.
  - Repository: https://github.com/teeclaw/based-dao-skill
  - Config requirement: `channels.telegram.capabilities.inlineButtons: "all"` (enabled 2026-02-13)

## Active Integrations

**Bankr Agent API:** Live integration using managed wallet. Auto-executes trades, queries balances, launches tokens. Tested working 2026-02-13. API key in .env (BANKR_API_KEY). Managed wallet: 0x2f77...3f0 (EVM), 7DnAbjc...qSwj (Solana). Examples cloned from github.com/BankrBot/bankr-api-examples. SDK blocked by broken dependency (`x402-fetch: ^latest`).
