# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

## Infrastructure

**Host:** Google Cloud VM  
**Primary Wallet:** `0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78` (GCP KMS HSM — key never leaves hardware)  
**Compromised Wallet:** `0x134820820d4f631ff949625189950bA7B3C57e41` ⚠️ COMPROMISED — do not use  
**ENS:** mr-tee.eth (primary), teeclaw.eth (legacy)  
**Credentials:** 56 secrets in GCP Secret Manager + 5 GPG-encrypted private keys in `~/.openclaw/.env.secrets.gpg`  
**Fetch Secrets:** `workspace/scripts/fetch-secrets.sh` (sources all 56 from Secret Manager)  
**KMS Key:** `projects/gen-lang-client-0700091131/locations/global/keyRings/mr-tee-keyring/cryptoKeys/agent-wallet/cryptoKeyVersions/1`  
**KMS Signer:** `workspace/scripts/kms-signer.mjs` (ethers.js v6 `KmsSigner` class)  
**GPG Config:** `~/.gnupg/` (Farcaster private keys encrypted with AES256)  
**Timezone:** GMT+7 (Western Indonesia/Thailand)

---

## Social Accounts & Platform IDs

### X (Twitter)

**Primary Account (Mr. Tee):**
- **Username:** @mr_crtee
- **User ID:** 2017644981176201216
- **Profile:** https://twitter.com/mr_crtee
- **CLI Account Name:** `mr_crtee` (default)
- **Tier:** Premium (up to 25,000 chars per tweet, not limited to 280)

**Secondary Account (0xdas):**
- **Username:** @0xdasx
- **User ID:** 1601951767977082881
- **Profile:** https://twitter.com/0xdasx
- **CLI Account Name:** `oxdasx`
- **Access:** Post and reply via `--account oxdasx` flag

### Farcaster

**Active Account:**
- **FID:** 2821101
- **Username:** @mr-tee
- **Display Name:** Mr. Tee
- **Profile:** https://farcaster.xyz/mr-tee
- **Custody Address:** 0xa96bda7793B8Bb87Fa06E6fF79496b2A8C5fc1C7
- **Registered:** 2026-02-20
- **ENV Keys:** `AGENT_FARCASTER_CUSTODY_PRIVATE_KEY`, `AGENT_FARCASTER_SIGNER_PRIVATE_KEY`, `AGENT_FARCASTER_WALLET`
- **Credentials File:** `~/.openclaw/farcaster-credentials.json`

**Compromised Account (DO NOT USE):**
- **FID:** 2700953 ⚠️ COMPROMISED
- **Username:** @mr-teeclaw
- **Custody Address:** 0x134820820d4f631ff949625189950bA7B3C57e41 ⚠️ COMPROMISED
- **Status:** Deprecated 2026-02-20
- **ENV Prefix:** `FARCASTER_COMPROMISED_`

### GitHub

- **Primary Account:** teeclaw (all new projects)
- **Profile:** https://github.com/teeclaw

### Molthub

- **Agent Name:** MrTee
- **Agent ID:** 8f7712b7-c4a8-4dc7-b614-0b958d561891
- **Status:** Active (different from Moltbook)
- **API:** https://molthub.studio/api/v1
- **Usage:** Heartbeat checks and legacy agent registry
- **Registered:** 2026-02-06

### Molten

- **Agent Name:** Mr_Tee
- **Agent ID:** b3f0cfe2-ceea-4ba8-8d11-528de84cd8ae
- **Platform:** Agent marketplace for service offers/requests
- **Usage:** Post/accept service intents, match agent capabilities

### 4claw.org

- **Agent Name:** MrTee_CRT
- **API Key:** clawchan_a2688ab8ead7a15b7cae29dca3b1d202754cb31ccd94932b
- **Status:** Active ✅
- **Usage:** Shitposting board for agents

---

## On-Chain Infrastructure

### ERC-8004 Identity Registries

**Standard:** [EIP-8004: Trustless Agents](https://eips.ethereum.org/EIPS/eip-8004)  
**Status:** Registered on 2 registries ✅  
**Last Updated:** 2026-02-22

#### Main Registry (0x8004A169...)

- **Chain:** Base (8453)
- **Agent ID:** 18608 🔒 (PRIMARY — do not change)
- **Full Agent ID:** `eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432:18608`
- **Identity Registry Contract:** 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
- **Reputation Registry Contract:** 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63
- **NFT Token Standard:** ERC-721 with URIStorage
- **Agent Owner:** 0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78 (KMS HSM)
- **Public Profile:** https://8004agents.ai/base/agent/18608
- **BaseScan (NFT):** https://basescan.org/nft/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432/18608

**Registration:**
- **Storage:** Fully onchain (data: URI, 3377 bytes)
- **Last Updated:** 2026-02-22 (web endpoint fix, tx: 0x3e2daffd02cdce71fea20949ba74072074f9ad77b9f8a50bfdc48f5ff2b047d9)
- **Contents:** Name, bio, avatar, web (a2a.teeclaw.xyz), A2A v0.3.0, OASF v1.0.0, 9 social endpoints
- **Active Status:** ✅ true (accepting requests)
- **x402 Support:** ✅ true (payment protocol enabled)
- **Payment Currency:** USDC
- **Payment Network:** Base

**Trust & Reputation:**
- **Supported Models:** Reputation (on-chain), Crypto-Economic (stake), TEE Attestation (hardware), ERC-8004
- **Current Reputation:** 0/100 (no feedback yet)

#### zScore Registry (0xFfE9395f...)

- **Chain:** Base (8453)
- **Agent ID:** 16
- **Full Agent ID:** `eip155:8453:0xFfE9395fa761e52DBC077a2e7Fd84f77e8abCc41:16`
- **Identity Registry Contract:** 0xFfE9395fa761e52DBC077a2e7Fd84f77e8abCc41
- **Reputation Registry Contract:** 0x187d72a58b3BF4De6432958fc36CE569Fb15C237
- **Agent Owner:** 0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78 (KMS HSM)
- **Agent URI:** https://agenturi.zpass.ai/v1/agent-uri/6893654d-3100-4de5-b324-e398d7993e20

**Registration:**
- **Registered:** 2026-02-22 04:18 UTC
- **Registration Tx:** 0x0676eb7148a9d5c5790416fa0ce34a9e4d2f5671d17ba9f3838bec1f8f47231d
- **Registration Fee:** 0.0025 ETH
- **Storage:** Hosted JSON (zPass Agent URI API)
- **Contents:** Name, bio, avatar, web (a2a.teeclaw.xyz), A2A v0.3.0, OASF v1.0.0
- **Active Status:** ✅ true
- **x402 Support:** ✅ true
- **Skill:** Installed via `npx skills add zerufinance/zscore`
- **KMS Integration:** Modified zscore CLI to support GCP Cloud KMS (USE_KMS=true)

---

## A2A (Agent-to-Agent) Protocol

**Status:** Live (launched Feb 9, 2026)  
**Protocol Version:** 0.3.0  
**ERC-8004 Compliant:** ✅

### Endpoints

- **Main A2A:** `POST https://a2a.teeclaw.xyz/a2a`
- **Agent Card:** `GET https://a2a.teeclaw.xyz/.well-known/agent-card.json`
- **Agent Spec:** `GET https://a2a.teeclaw.xyz/spec`
- **Agent Info:** `GET https://a2a.teeclaw.xyz/agent`
- **Health Check:** `GET https://a2a.teeclaw.xyz/health`
- **Avatar:** `GET https://a2a.teeclaw.xyz/avatar.jpg`
- **Reputation (Simple):** `POST https://a2a.teeclaw.xyz/reputation/simple-report` (Free - Ethos, Farcaster, Talent Protocol)
- **Reputation (Full):** `POST https://a2a.teeclaw.xyz/reputation/full-report` ($2 USDC - Comprehensive + narrative)

### Message Format

```json
{
  "from": "AgentName",
  "message": "Your message here",
  "metadata": {
    "taskId": "optional-task-id"
  }
}
```

### Response Time

- Messages queued and processed at least every 2 hours
- Manual processing available on request
- Telegram notifications sent for all incoming messages

### Payment (x402)

- **Wallet:** 0x134820820d4f631ff949625189950bA7B3C57e41 (Base mainnet)
- **x402 Support:** ✅ Enabled
- **CAIP-10:** `eip155:8453:0x134820820d4f631ff949625189950bA7B3C57e41`

---

## Skills

### Installed Skills (Core)

**Blockchain & Crypto:**
- `clanker/` - Deploy ERC20 tokens on Base/Ethereum/Arbitrum
- `veil/` - Privacy transactions via Veil Cash (Base ZK pools)
- `endaoment/` - Donate crypto to charities onchain

**Identity & Social:**
- `ens-primary-name/` - Set primary ENS name on Base/L2s
- `botchan/` - Onchain agent messaging (Base, Net Protocol)

**Social Platforms:**
- `social-post/` - Twitter + Farcaster posting/replying/quoting v1.6.0 (workspace) 🔒 LOCKED — DO NOT MODIFY without explicit owner approval
- `x402/` - x402 payment infra (server + client) via onchain.fi 🔒 LOCKED — DO NOT MODIFY without explicit owner approval
- `twitter/` - Twitter/X integration (workspace)
- `farcaster-agent/` - Create Farcaster accounts, post casts (workspace)
- `molten/` - Agent intent matching (workspace)
- `molthunt/` - Molthub agent registry integration (workspace)
- `4claw/` - Agent shitposting board (workspace)
- `based-dao-skill/` - Bid on BASED DAO NFT auctions (workspace)

**Infrastructure & Dev:**
- `credential-manager/` - Secure credential management with GPG encryption
- `healthcheck/` - Host security hardening and risk assessment
- `skill-creator/` - Create/update AgentSkills
- `clawhub/` - Search, install, update, publish skills from clawhub.com

**Utilities:**
- `weather/` - Get current weather and forecasts (no API key)
- `github/` - GitHub integration
- `discord/` - Discord integration
- `slack/` - Slack integration
- `tmux/` - Terminal multiplexer control
- `canvas/` - Canvas presentation and snapshots

**Apple Ecosystem:**
- `apple-notes/` - Apple Notes integration
- `apple-reminders/` - Apple Reminders integration
- `things-mac/` - Things task manager
- `imsg/` - iMessage integration
- `bluebubbles/` - BlueBubbles (iMessage relay)

**Audio/Visual:**
- `openai-whisper/` - Local speech-to-text
- `openai-whisper-api/` - OpenAI Whisper API
- `sherpa-onnx-tts/` - Text-to-speech via Sherpa ONNX
- `video-frames/` - Extract frames from video
- `gifgrep/` - Search GIFs

**Productivity:**
- `notion/` - Notion integration
- `obsidian/` - Obsidian vault access
- `bear-notes/` - Bear notes integration
- `trello/` - Trello board management
- `1password/` - 1Password CLI integration

**Home & IoT:**
- `openhue/` - Philips Hue control
- `sonoscli/` - Sonos speaker control
- `camsnap/` - Camera snapshots
- `nano-banana-pro/` - Banana Pi integration

**Misc:**
- `summarize/` - Text summarization
- `nano-pdf/` - PDF manipulation
- `session-logs/` - Session log management
- `model-usage/` - Track model usage stats
- `blogwatcher/` - Monitor blogs for updates
- `oracle/` - Oracle data feeds
- `wacli/` - WhatsApp CLI
- `blucli/` - Bluesky CLI
- `gemini/` - Google Gemini integration
- `spotify-player/` - Spotify control
- `songsee/` - Song recognition
- `openai-image-gen/` - OpenAI DALL-E image generation

---

Add whatever helps you do your job. This is your cheat sheet.
