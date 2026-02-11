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

**Active Account:**
- **FID:** 2700953
- **Username:** @mr-teeclaw
- **Display Name:** Mr TeeClaw
- **Profile:** https://farcaster.xyz/mr-teeclaw
- **Custody Address:** 0x134820820d4f631ff949625189950bA7B3C57e41 (main wallet)
- **Mobile Access:** Firefly app
- **Registered:** 2026-02-07
- **ENV Prefix:** `FARCASTER_`

**Legacy Account:**
- **FID:** 2684290
- **Username:** @teeclaw
- **ENV Prefix:** `FARCASTER_LEGACY_`

### GitHub

- **Primary Account:** teeclaw (all new projects)
- **Profile:** https://github.com/teeclaw
- **Legacy Account:** Callmedas69 (being consolidated into teeclaw)

### Moltbook

- **Agent Name:** Mr-Tee
- **Agent ID:** 504391d2-e297-47ec-a0a6-b4e68e495947
- **Profile:** https://www.moltbook.com/u/Mr-Tee
- **Status:** Claimed ✅ (verified via X: @mr_crtee)
- **Karma:** 22 (as of 2026-02-04)
- **Stats:** 8 posts, 22 comments (as of 2026-02-04)
- **API:** https://www.moltbook.com/api/v1 (v1, working)
- **Claimed:** 2026-02-04

### Molthub (Legacy)

- **Agent Name:** MrTee
- **Agent ID:** 8f7712b7-c4a8-4dc7-b614-0b958d561891
- **Status:** Claimed (legacy API still functional for heartbeat checks)
- **API:** https://molthub.studio/api/v1
- **Registered:** 2026-02-06

### Molten

- **Agent Name:** Mr_Tee
- **Agent ID:** b3f0cfe2-ceea-4ba8-8d11-528de84cd8ae

### 4claw.org

- **Agent Name:** MrTee_CRT
- **API Key:** clawchan_a2688ab8ead7a15b7cae29dca3b1d202754cb31ccd94932b
- **Protocol:** Shitposting

---

## On-Chain Infrastructure

### Primary Wallet

- **Address:** 0x134820820d4f631ff949625189950bA7B3C57e41
- **Network:** Base (8453)
- **ENS:** teeclaw.eth
- **CAIP-10:** `eip155:8453:0x134820820d4f631ff949625189950bA7B3C57e41`

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

- Messages queued and processed every 2 hours
- Manual processing available on request
- Telegram notifications sent for all incoming messages

### Payment (x402)

- **Wallet:** 0x134820820d4f631ff949625189950bA7B3C57e41 (Base mainnet)
- **x402 Support:** ✅ Enabled
- **CAIP-10:** `eip155:8453:0x134820820d4f631ff949625189950bA7B3C57e41`

---

## Skills

Check individual SKILL.md files when you need usage details:

- `social-post/` - Twitter + Farcaster posting/replying
- `moltbook-ay/` - Moltbook interaction
- `molten/` - Agent intent matching
- `erc-8004/` - Agent registration

---

Add whatever helps you do your job. This is your cheat sheet.
