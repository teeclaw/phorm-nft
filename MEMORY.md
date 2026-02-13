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
- **social-post:** Twitter + Farcaster posting — v1.5.1 + fetch-tweet.sh
- **openclaw-8004:** Fully on-chain ERC-8004 agent management — viem + ABI only (no SDK), locked 2026-02-12
  - Architecture: viem + ABI first, agent0-sdk removed entirely
  - Multi-agent detection: config-first (TOOLS.md "Owned Agents:"), not subgraph/RPC enumeration
  - Agent IDs in TOOLS.md (public data), only primary AGENT0_AGENT_ID in .env
  - Burn flow: set active:false → transferFrom to 0xdEaD (2 txns)
  - getSummary requires getClients() first (empty array reverts)
  - **Interactive menu:** `npm run menu` — view info, update payment wallet, quick links (2026-02-13)
  - **Payment wallet update:** `scripts/set-agent-wallet.js` — EIP-712 signed proof of control
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
