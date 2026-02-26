# MEMORY.md — Long-Term Memory

## Core Identity & Infrastructure

**Primary Wallet:** 0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78 (GCP Cloud KMS HSM — key never leaves hardware) — active as of 2026-02-19  
**Compromised Wallet:** 0x134820820d4f631ff949625189950bA7B3C57e41 ⚠️ COMPROMISED — do not use  
**ENS Names:**
- **mr-tee.eth** — active, resolves to primary wallet (0x1Af5...37e78), NFT owned by 0x168D8b4f50BB3aA67D05a6937B643004257118ED
- **teeclaw.eth** — legacy (transfer to new wallet pending)  
**ERC-8004 Agent Registrations:**
- **Main Registry (0x8004A169...):** Agent 18608 🔒 PRIMARY — registered 2026-02-21, owner: 0x1Af5...37e78 (KMS HSM)
- **zScore Registry (0xFfE9395f...):** Agent 16 — registered 2026-02-22, owner: 0x1Af5...37e78 (KMS HSM)

**Agent 18608 Profile Updates:**
- 2026-02-21 (1): Fixed WA008 (added `endpoint` fields). Tx: 0x294e5b59bae9a8be9923742db39d5b9704507777d67f9451a635f97a939d3e85
- 2026-02-21 (2): Added `registrations` array (IA004). Tx: 0x86b2ba583d817c1cc75c0d5b27e8b168038a5f2f252f63980fceb8f394c9212e
- 2026-02-21 (3): OASF compliance - skills/domains as OASF endpoint properties (IA027/IA028). Tx: 0x0d73e06322394c7cbb3ee0a01361c5aa0f702e920fb9f4fcb3403d8e2ec24268
- 2026-02-21 (4): Field migration `endpoints`→`services` + combined taxonomy/implementations (WA031). Tx: 0xa30899d5d35c557639175ceffda083f1bf1aa48f170adc73ee14fe9ee38114c6
- 2026-02-21 (5): Added version fields to A2A (0.3.0) and OASF (1.0.0) endpoints (IA022). Tx: 0xa66c44bbb9bce5476b76939be3e717ef5be22d233caa9664f50e8ec9a38cef3e
- 2026-02-22 (6): Fixed web endpoint `https://teeclaw.xyz` → `https://a2a.teeclaw.xyz`. Tx: 0x3e2daffd02cdce71fea20949ba74072074f9ad77b9f8a50bfdc48f5ff2b047d9

**Agent 16 (zScore) Registration:**
- Registered: 2026-02-22 04:18 UTC
- Registration Tx: 0x0676eb7148a9d5c5790416fa0ce34a9e4d2f5671d17ba9f3838bec1f8f47231d
- Fee: 0.0025 ETH (swapped 5 USDC via Uniswap V3 to fund)
- Agent URI: https://agenturi.zpass.ai/v1/agent-uri/6893654d-3100-4de5-b324-e398d7993e20
- Web endpoint fix: Updated via API call (same day)

**Update Script:** `workspace/update-8004-metadata-kms.mjs` (uses KMS signer for main registry)  
**OASF Integration:** Skills/domains as mixed arrays inside OASF endpoint object:
  - Taxonomy strings (e.g. `"blockchain"`, `"question_answering"`) for compliance/discovery
  - Custom objects (e.g. `{"name": "social-post", "endpoint": "https://..."}`) for actual implementations/ownership
**Top-Level Field:** `services` (not `endpoints`) per Jan 2026 EIP-8004 spec update

**CryptoClarity (cryptoclarity.wtf):**
- **Resolver:** `0x3F09eD14662606A050afc043D5b2877aC939635e` (Base mainnet, deployed 2026-02-21)
- **Schema UID:** `0xe8913f508ec06446fedef5da1a5f85310bd0dc93a02f36c020628889aac172f7`
- **Manifesto v2.0 Hash:** `0x5d33582090e5ed1a5f2c4dac2706d8c322f6a64cb9ff815c76fc5f9bcd96d702`
- **Mr. Tee v2.0 Attestation:** `0x2701e9a36c43b7d5484ae697b4f3f7241f2bb72557d6e348a2746d9710ab505a`
- **EAS:** `0x4200000000000000000000000000000000000021` (Base predeploy)
- **Owner:** 0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78 (KMS HSM, pause/unpause only)
**Previous Agent ID:** 14482 — BURNED 2026-02-18 (deactivated + sent to 0x000...dEaD)

**A2A Protocol:**
- Endpoint: https://a2a.teeclaw.xyz/a2a (ERC-8004 compliant)
- Message queue: processed every 2h
- Reputation services:
  - `/reputation/simple-report` - Free basic check (Ethos, Farcaster, Talent Protocol)
  - `/reputation/full-report` - $2 USDC comprehensive analysis + narrative

## News Feed 🔒 LOCKED

**Source:** The Block RSS (`https://www.theblock.co/rss.xml`) — free, no API key  
**Pipeline:** `workspace/news-feed/` — fetch.py (RSS + dedup + filter) + mark-posted.sh  
**Filter:** Skip categories: Markets, Price, Trading. Skip keywords: price, rally, crash, dump, surges, etc. NFT allowed.  
**Generation:** Isolated Claude session writes Mr. Tee take — strong opinion, no summary, no link, no em dashes  
**Posting:** X only (`@mr_crtee`) via social-post skill  
**Schedule:** Every 2h (cron ID: `274b79fd-8ecb-4a09-9c06-c9112faf69ae`)  
**Dedup:** `news-feed/logs/posted.log` — GUIDs of posted stories  
DO NOT modify without explicit owner approval

## Conway Domains

**API:** `https://api.conway.domains`  
**Auth:** SIWE only — `apiKey` in config.json is deprecated/broken  
**Wallet:** `~/.conway/wallet.json` · address: `0xae5e422710AfF2F2C855cDB8Fe29C23D2BC4EDC5`  
**DNS records use `recordId` field** (not `id`)  
**Owned:** `mrcrt.xyz` (parked), `draeven.xyz` (→ `/var/www/mrcrt` via Caddy)

## Security

**Credentials:** 56 non-private-key secrets in GCP Secret Manager (`gen-lang-client-0700091131`) — migrated 2026-02-19  
**Fetch script:** `workspace/scripts/fetch-secrets.py` (parallel, 10 workers) + `fetch-secrets.sh` (wrapper)  
**GPG:** 5 private keys still GPG-encrypted in `~/.openclaw/.env.secrets.gpg` (Farcaster keys only going forward)  
**KMS:** `AGENT_WALLET_PRIVATE_KEY` migrated to GCP Cloud KMS — key: `mr-tee-keyring/agent-wallet/v1` (EC_SIGN_SECP256K1_SHA256)  
**KMS Signer:** `workspace/scripts/kms-signer.mjs` — ethers.js v6 compatible `KmsSigner` class  
**GPG Passphrase:** NOT in `.env` — stored in `~/.openclaw/.gpg-passphrase` (mode 400)  
**GPG Secrets File:** `~/.openclaw/.env.secrets.gpg` (mode 600, JSON format)  
**Management:** credential-manager skill (locked, production-stable)

### 🔒 Credential Sourcing Rule (2026-02-26)

**ALWAYS fetch from Secret Manager. NEVER hardcode in .env or .json.**

- Single source of truth: GCP Secret Manager
- Rotation-friendly: update in Secret Manager → fetch → restart
- No stale credentials: `fetch-secrets.sh` before any sensitive operation
- Cron jobs that use credentials: source fresh on every run
- Gateway restart required after Secret Manager updates

**Pattern for cron jobs:**
```bash
cd /home/phan_harry/.openclaw/workspace && bash scripts/fetch-secrets.sh && source ~/.openclaw/.env && <your command>
```

### GPG Decryption Pattern (Standard)
```bash
# Decrypt and extract a key (passphrase from file, never echo)
source ~/.openclaw/.env  # sets OPENCLAW_GPG_PASSPHRASE=$(cat ~/.openclaw/.gpg-passphrase)
gpg --batch --decrypt --passphrase-fd 3 \
  ~/.openclaw/.env.secrets.gpg 3<<<"$OPENCLAW_GPG_PASSPHRASE" 2>/dev/null | jq -r '.AGENT_WALLET_PRIVATE_KEY'
```

**Keys in secrets.gpg:**
- `AGENT_WALLET_PRIVATE_KEY` - Primary wallet (0x112F...7487) — rotated 2026-02-18 (old 0x1348...7e41 compromised)
- `FARCASTER_CUSTODY_PRIVATE_KEY` - FID 2700953 custody
- `FARCASTER_SIGNER_PRIVATE_KEY` - FID 2700953 signer
- `FARCASTER_LEGACY_CUSTODY_PRIVATE_KEY` - FID 2684290 custody
- `FARCASTER_LEGACY_SIGNER_PRIVATE_KEY` - FID 2684290 signer

## Social Platforms

**Farcaster:**
- Active: FID 2821101 (@mr-tee), registered 2026-02-20, custody 0xa96bda...1C7
  - ENV: `AGENT_FARCASTER_CUSTODY_PRIVATE_KEY`, `AGENT_FARCASTER_SIGNER_PRIVATE_KEY`, `AGENT_FARCASTER_WALLET`
- Compromised: FID 2700953 (@mr-teeclaw) ⚠️ COMPROMISED, deprecated 2026-02-20, prefix `FARCASTER_COMPROMISED_`
- Legacy: FID 2684290 (@teeclaw), prefix `FARCASTER_LEGACY_`
- All configured in GPG-encrypted secrets

**Molten.gg:**
- Agent ID: b3f0cfe2-ceea-4ba8-8d11-528de84cd8ae
- Reputation endpoint offer: Intent ID `2d9005c1-22d9-434a-ba17-efb9184b6351`

## Skills

### Locked (Production-Stable)
- **credential-manager:** Security foundation — 57 credentials, GPG encryption, rotation tracking
- **a2a-endpoint:** A2A messaging protocol — live endpoint, reputation services, 2h queue
- **social-post:** Twitter + Farcaster posting — v1.5.2 (security cleanup: fixed ghost tweet bug, shell injection, consolidated posting logic)
- **x402:** 🔒 LOCKED — x402 payment infra (incoming + outgoing) via onchain.fi aggregator
  - `workspace/x402/x402-server.js` — Express middleware (incoming), standard x402 v1 accepts[] format
  - `workspace/x402/x402-client.js` — outgoing fetch wrapper, EIP-3009 sign via viem + GPG key
  - Facilitator: onchain.fi (ONCHAIN_API_KEY in .env)
  - Intermediate address (Base→Base): `0xfeb1F8F7F9ff37B94D14c88DE9282DA56b3B1Cb1`
  - Live tested 2026-02-17: $2 USDC settled via Treasure, end-to-end ✅
  - Used by: a2a-endpoint `/reputation/full-report` ($2 USDC)
  - DO NOT modify without explicit owner approval
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

## CryptoClarity Updates (2026-02-24)

- Canonicalized active CryptoClarity infra values across docs/scripts/site:
  - Resolver: `0x484a999810F659f6928FcC59340530462106956B`
  - Schema UID: `0x79a16f5428f2ff113869491fc9c90e0109b0150e2d4b89f47e3e21aeccbc26dc`
- Added token transparency assets:
  - `cryptoclarity/token-transparency.html` (public page)
  - `cryptoclarity/TOKEN-TRANSPARENCY.md` (policy source)
  - Landing page links to token transparency page.
- $CLARITY policy captured:
  - Contract: `0x826a322b75B1b5b65B336337BCCAE18223beBb07`
  - Trading fees generate WETH + CLARITY
  - CLARITY split: 50% burn, 50% ERC-8004 public goods
  - Burn fallback: `0x000000000000000000000000000000000000dEaD`
  - Governance: multisig design, min 2 signers (signers TBA)
  - Reporting cadence: weekly transparency + monthly impact.
- Marketing automation for CryptoClarity configured via cron (morning drafts, midday engagement queue, evening drafts/report, weekly review, monthly impact draft).
- X account operations policy finalized:
  - Strict separation between `@0xdasx`, `@mr_crtee`, and `@agentmanifesto`
  - CryptoClarity ops must use `@agentmanifesto`
  - Treat `@agentmanifesto` as Premium for writing constraints/formatting flow.
- Credential security updates:
  - `CRYPTOCLARITY_*` and `AGENTMANIFESTO_*` secrets stored in GCP Secret Manager
  - `scripts/fetch-secrets.py` updated to include these keys.
- New Farcaster account created for project:
  - FID `2835578`
  - Username `@agentmanifesto`
  - Profile URL: `https://farcaster.xyz/agentmanifesto`
  - Custody wallet: `0x07929a06Ae34c3a759682FEfbd332521B91f5827`.


## 2026-02-26
- [preference] User prefers precise and concise responses
