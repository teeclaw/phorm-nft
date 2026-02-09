---
name: basecred-8004-registration
description: Interactive ERC-8004 agent registration via chat. Guides users through a prefill form, shows draft, confirms, then registers on-chain using agent0-sdk.
---

# Basecred ERC-8004 Registration

Register AI agents on the [ERC-8004](https://8004.org) on-chain registry through a guided chat experience.

## Registration Flow

### Step 1: Auto-Prefill

When the user triggers registration, **auto-fill every field you can** from:
- Agent identity files (IDENTITY.md, SOUL.md, USER.md)
- Environment (`.env` — wallet address derived from private key)
- Previous context (A2A endpoint, description, image, etc.)
- Sensible defaults (version: 1.0.0, license: MIT, chain: Base, storage: onchain)

**Do NOT ask questions one by one.** Prefill first, ask later.

### Step 1.5: Explain Config Defaults

Before showing the draft, briefly explain the config section so users understand what's pre-selected and what alternatives exist:

```
⚙️ Config defaults (you can change these later):

Chain:    Base (8453) — where your agent lives on-chain
          Others: Ethereum, Polygon, BNB, Arbitrum, Celo, Gnosis, Scroll

Storage:  Fully onchain (http) — agent data stored directly on-chain
          Alternative: IPFS — data pinned to IPFS, hash stored on-chain

Trust:    Reputation — other agents/users rate your agent on-chain
          Others: Crypto-Economic (staking/slashing guarantees)
                  TEE Attestation (hardware-level trust proof)

x402:     Off — no payment protocol
          On: agent can charge for services via x402 payment protocol

Active:   On — agent is discoverable and accepting requests
          Off: registered but hidden from discovery
```

Keep this concise — show it once at the start, not repeated on every draft.

### Step 2: Show Full Draft with Buttons (Single Message)

Send the **entire draft + buttons as one message** using the `message` tool. This keeps buttons directly below the draft, not as a separate message.

**Important:** Use `message action=send` with both `message` (the draft text) and `buttons` (inline buttons). Do NOT split into reply + separate button message.

The draft text should use ✅ (filled) and ⚠️ (missing/needs attention):

```
📋 Agent Registration Draft

── Basic Info ──
✅ Name:        Mr. Tee
✅ Description: AI agent with a CRT monitor...
✅ Image:       pbs.twimg.com/...
✅ Version:     1.0.0
✅ Author:      0xdas
✅ License:     MIT

── Endpoints ──
✅ A2A:         a2a.teeclaw.xyz/a2a
⚠️ MCP:         (none)

── Skills & Domains ──
✅ Skills (5):  NLP, Summarization, Q&A, Code Gen, CV
✅ Domains (5): Blockchain, DeFi, Technology, SE, DevOps
✅ Custom:      Agent Coordination, Social Media Mgmt

── Config ──
✅ Chain:       Base (8453)
✅ Storage:     Fully onchain
✅ Active:      true
✅ Trust:       reputation
✅ x402:        false
✅ Wallet:      0x1348...e41 (auto)

Tap to edit a section or register:
```

Buttons (attached to same message):
```
[✏️ Basic Info] [✏️ Endpoints]
[✏️ Skills & Domains] [✏️ Config]
[✅ Register] [❌ Cancel]
```

After sending this single message, reply with `NO_REPLY` to avoid a duplicate reply.

### Step 3: Section Editing (on button tap)

When user taps an edit button, show that section's fields with selectable options:

#### Edit Basic Info
Show current values, let user type corrections:
```
Current: Name = "Mr. Tee"
Type new value or "skip" to keep:
```

#### Edit Endpoints
```
Current A2A: https://a2a.teeclaw.xyz/a2a
Current MCP: (none)
Type new URL or "skip":
```

#### Edit Skills & Domains
Show as toggleable inline buttons (multi-select):

**Skills:**
```
[NLP ✅] [Summarization ✅] [Q&A ✅] [Code Gen ✅] [CV ✅]
[Data Analysis] [Web Search] [Image Gen] [Translation]
[Task Automation] [+ Custom] [Done ✅]
```

**Domains:**
```
[Blockchain ✅] [DeFi ✅] [Technology ✅] [SE ✅] [DevOps ✅]
[Finance] [Healthcare] [Education] [Entertainment]
[Science] [Creative Arts] [Dev Tools] [+ Custom] [Done ✅]
```

Tapping toggles ✅ on/off. `+ Custom` prompts user to type a custom entry.

#### Edit Config
**Trust models** (multi-select):
```
[Reputation ✅] [Crypto-Economic] [TEE Attestation]
```

**Other config:**
```
[Chain: Base ▼] [Storage: Onchain ▼] [x402: Off ▼]
```

| Trust Model | Description |
|-------------|-------------|
| **Reputation** | On-chain feedback & scoring. Default for most agents. |
| **Crypto-Economic** | Staking/slashing guarantees. For financial agents. |
| **TEE Attestation** | Hardware-level trust proof. For high-security agents. |

### Step 4: Back to Draft

After any edit, re-send the updated full draft as a **single message with buttons** (same as Step 2). Repeat until user taps **✅ Register**.

### Step 5: Execute

Only after explicit ✅ Register confirmation:

```bash
source /path/to/.env
node scripts/register.mjs --json /tmp/registration.json --chain 8453 --yes
```

The script handles:
1. `register()` — mint agent NFT on-chain
2. `setA2A()` / `setMCP()` — set endpoints
3. `addSkill()` / `addDomain()` — set OASF taxonomy
4. `setWallet()` — link wallet with EIP-712 signature

### Step 6: Report Result

```
✅ Agent Registered on Base!

  Agent ID:    8453:42
  Wallet:      0x1348...e41
  A2A:         a2a.teeclaw.xyz/a2a
  TX:          0xabc...def

  View: https://8004.org/agent/8453:42
```

## All Fields Reference

### Basic Info
| Field | Required | Default | Auto-source |
|-------|----------|---------|-------------|
| **Agent Name** | ✅ | — | IDENTITY.md |
| **Agent Address** | auto | — | Derived from `.env` private key |
| **Description** | ✅ | — | IDENTITY.md / SOUL.md |
| **Image** | No | — | Profile image URL |
| **Version** | No | `1.0.0` | — |
| **Author** | No | — | USER.md (human's name) |
| **License** | No | `MIT` | — |

### Endpoints
| Field | Required | Default | Auto-source |
|-------|----------|---------|-------------|
| **A2A Endpoint** | No | — | IDENTITY.md |
| **MCP Endpoint** | No | — | — |

### Skills & Domains
| Field | Required | Default |
|-------|----------|---------|
| **Selected Skills** | No | `[]` |
| **Selected Domains** | No | `[]` |
| **Custom Skills** | No | `[]` |
| **Custom Domains** | No | `[]` |

### Advanced Config
| Field | Required | Default |
|-------|----------|---------|
| **Trust Models** | No | `[]` (suggest: reputation) |
| **x402 Support** | No | `false` |
| **Storage** | No | `http` (fully onchain) |
| **Active** | No | `true` |
| **Chain** | No | `8453` (Base) |

## Supported Chains

| Chain | ID | Default |
|-------|-----|---------|
| **Base** | 8453 | ✅ |
| Ethereum | 1 | |
| Polygon | 137 | |
| BNB Chain | 56 | |
| Arbitrum | 42161 | |
| Celo | 42220 | |
| Gnosis | 100 | |
| Scroll | 534352 | |

## JSON Template (8004.org format)

```json
{
  "basicInfo": {
    "agentName": "",
    "agentAddress": "",
    "description": "",
    "image": "",
    "version": "1.0.0",
    "author": "",
    "license": "MIT"
  },
  "endpoints": {
    "mcpEndpoint": "",
    "a2aEndpoint": ""
  },
  "skillsDomains": {
    "selectedSkills": [],
    "selectedDomains": [],
    "customSkills": [],
    "customDomains": []
  },
  "advancedConfig": {
    "supportedTrusts": [],
    "x402support": false,
    "storageMethod": "http",
    "active": true
  },
  "version": "1.0.0"
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` / `AGENT_PRIVATE_KEY` / `MAIN_WALLET_PRIVATE_KEY` | Yes | Wallet private key |
| `RPC_URL` | No | Custom RPC (auto-detected per chain) |
| `CHAIN_ID` | No | Default chain (8453) |

## Other Operations

### Search Agents
```bash
node scripts/search.mjs --name "AgentName" --chain 8453
```

### Update Agent
```bash
node scripts/update.mjs --agent-id "8453:42" --name "NewName" --yes
```

### Give Feedback
```bash
node scripts/feedback.mjs --agent-id "8453:42" --value 5 --tag1 "reliable" --yes
```

## Setup

```bash
bash scripts/setup.sh
```
