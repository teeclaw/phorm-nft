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

## Conway Domains

**API:** `https://api.conway.domains` (provider: namesilo backend)  
**Auth:** SIWE (Sign-In with Ethereum) — signs with Conway wallet → gets JWT Bearer token  
**Wallet:** `~/.conway/wallet.json` (contains `privateKey`)  
**Wallet Address:** `0xae5e422710AfF2F2C855cDB8Fe29C23D2BC4EDC5`  
**Config:** `~/.conway/config.json` (walletAddress + provisionedAt; API key field deprecated/invalid)  
**Note:** The `apiKey` in config.json does NOT work — must use SIWE auth flow  

**SIWE Auth Flow:**
1. `POST /auth/nonce` → get nonce
2. Sign SiweMessage (chainId: 8453, domain: api.conway.domains)
3. `POST /auth/verify` → get `access_token` (JWT, valid 50 min)
4. Use `Authorization: Bearer <token>` for all domain API calls

**DNS Endpoints:**
- List: `GET /domains/{domain}/dns`
- Add: `POST /domains/{domain}/dns`
- Update: `PUT /domains/{domain}/dns/{recordId}` — use `recordId` field (not `id`)
- Delete: `DELETE /domains/{domain}/dns/{recordId}`

**Owned Domains:**
- `mrcrt.xyz` — parked
- `draeven.xyz` — Draeven landing page, served from `/var/www/mrcrt` via Caddy

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
  ~/.openclaw/.env.secrets.gpg 2>/dev/null | jq -r '.AGENT_WALLET_PRIVATE_KEY'
```

**Keys in secrets.gpg:**
- `AGENT_WALLET_PRIVATE_KEY` - Primary wallet (0x1348...7e41)
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
- **social-post:** Twitter + Farcaster posting — v1.5.2 (security cleanup: fixed ghost tweet bug, shell injection, consolidated posting logic)
- **openclaw-8004:** Full ERC-8004 agent management via Telegram inline buttons — viem + GPG encryption
  - **v3.2.0 (2026-02-13):** Clean rebuild + UX overhaul — 10 scripts, 2 core files, official ABIs
  - **Core files:** `menu-config.js` (menu definitions) + `handle-command.js` (router + Telegram API)
  - **Official ABIs:** `abis/IdentityRegistry.json` + `abis/ReputationRegistry.json` (from erc-8004/erc-8004-contracts)
  - **Menu:** Main → [View Profile, Manage, Reputation, Links] → Action screens
  - **Manage:** Register (Minimal or Full JSON template), Update (downloadable JSON), Transfer (danger warning)
  - **Reputation:** Rate agent (0-100 + tags per spec), Search (getClients→getSummary→readAllFeedback)
  - **Links:** URL buttons to BaseScan, 8004agents.ai, EIP-8004 spec (dynamic agent ID)
  - **Profile viewer:** Decodes base64 data URIs, shows full JSON (name, description, services, skills, domains)
  - **Data URI only:** All profiles stored fully on-chain as base64 data URIs
  - **UX:** Nav buttons on every response, loading states, error recovery with [Try Again], no dead ends
  - **Plain text output** — no Markdown to avoid Telegram parsing issues with URLs
  - **Security:** GPG-encrypted private key from `~/.openclaw/.env.secrets.gpg`, in-memory decryption only
  - **Contracts:** Identity Registry (0x8004A169...), Reputation Registry (0x8004BAa1...)
  - **Trigger:** Say "8004" or "erc-8004" → sends main panel with live agent data
  - **Callbacks:** `/8004_main`, `/8004_m_<menu>`, `/8004_<action>`, `/8004_do_<action> args`
  - **Repository:** Local workspace skill (production-stable, locked)
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
