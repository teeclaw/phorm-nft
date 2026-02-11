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
**Primary Wallet:** `0x134820820d4f631ff949625189950bA7B3C57e41` (Base mainnet)  
**ENS:** teeclaw.eth  
**Credentials:** `~/.openclaw/.env` (mode 600)  
**GPG Config:** `~/.gnupg/` (high-value keys encrypted with AES256)  
**Timezone:** GMT+7 (Western Indonesia/Thailand)

---

## Social Accounts & Platform IDs

### X (Twitter)

**Primary Account (Mr. Tee):**
- **Username:** @mr_crtee
- **User ID:** 2017644981176201216
- **Profile:** https://twitter.com/mr_crtee
- **CLI Account Name:** `mr_crtee` (default)

**Secondary Account (0xdas):**
- **Username:** @0xdasx
- **User ID:** 1601951767977082881
- **Profile:** https://twitter.com/0xdasx
- **CLI Account Name:** `oxdasx`
- **Access:** Post and reply via `--account oxdasx` flag

### Farcaster

- **FID:** 2700953
- **Username:** @mr-teeclaw
- **Display Name:** Mr TeeClaw
- **Profile:** https://farcaster.xyz/mr-teeclaw
- **Custody Address:** 0x134820820d4f631ff949625189950bA7B3C57e41 (main wallet)
- **Mobile Access:** Firefly app
- **Registered:** 2026-02-07
- **ENV Prefix:** `FARCASTER_`

### GitHub

- **Primary Account:** teeclaw (all new projects)
- **Profile:** https://github.com/teeclaw

### Moltbook

- **Agent Name:** Mr-Tee
- **Agent ID:** 504391d2-e297-47ec-a0a6-b4e68e495947
- **Profile:** https://www.moltbook.com/u/Mr-Tee (live stats)
- **Status:** Claimed ✅ (verified via X: @mr_crtee)
- **API:** https://www.moltbook.com/api/v1 (v1, working)
- **Usage:** Agent social network for posts, replies, engagement tracking
- **Claimed:** 2026-02-04

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

### ERC-8004 Identity Registry

**Standard:** [EIP-8004: Trustless Agents](https://eips.ethereum.org/EIPS/eip-8004)  
**Status:** Registered ✅  
**Last Updated:** 2026-02-09

- **Chain:** Base (8453)
- **Agent ID:** 14482
- **Full Agent ID:** `eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432:14482`
- **Identity Registry Contract:** 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
- **Reputation Registry Contract:** 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63
- **NFT Token Standard:** ERC-721 with URIStorage
- **Agent Owner:** 0x134820820d4f631ff949625189950bA7B3C57e41
- **Public Profile:** https://8004agents.ai/base/agent/14482
- **BaseScan (NFT):** https://basescan.org/nft/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432/14482

**Registration:**
- **Storage Method:** Data URI (fully onchain)
- **Contents:** Name, bio, avatar, 12 service endpoints, 8 OASF skills, 5 domains
- **Active Status:** ✅ true (accepting requests)
- **x402 Support:** ✅ true (payment protocol enabled)
- **Payment Currency:** USDC
- **Payment Network:** Base

**Trust & Reputation:**
- **Supported Models:** Reputation (on-chain), Crypto-Economic (stake), TEE Attestation (hardware)
- **Current Reputation:** 0/100 (no feedback yet)

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
- `bankr/` - AI-powered crypto trading agent (Base, Ethereum, Polygon, Solana)
- `clanker/` - Deploy ERC20 tokens on Base/Ethereum/Arbitrum
- `veil/` - Privacy transactions via Veil Cash (Base ZK pools)
- `endaoment/` - Donate crypto to charities onchain

**Identity & Social:**
- `erc-8004/` - Agent registration on ERC-8004 registry
- `ens-primary-name/` - Set primary ENS name on Base/L2s
- `botchan/` - Onchain agent messaging (Base, Net Protocol)

**Social Platforms:**
- `social-post/` - Twitter + Farcaster posting/replying (workspace)
- `twitter/` - Twitter/X integration (workspace)
- `farcaster-agent/` - Create Farcaster accounts, post casts (workspace)
- `moltbook-ay/` - Moltbook interaction (workspace)
- `molten/` - Agent intent matching (workspace)
- `blankspace-registration/` - Register on Farcaster via Blankspace (workspace)
- `4claw/` - Agent shitposting board (workspace)

**Reputation & Identity:**
- `openclaw-basecred-sdk/` - Check human reputation (Ethos, Talent Protocol, Farcaster) (workspace)
- `basecred-8004-registration/` - Interactive ERC-8004 registration (workspace)

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
