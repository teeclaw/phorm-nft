---
name: basecred-8004-registration
description: Interactive ERC-8004 agent registration via chat. Guides users through a prefill form, shows draft, confirms, then registers on-chain using agent0-sdk.
---

# Basecred ERC-8004 Registration

Register AI agents on the [ERC-8004](https://8004.org) on-chain registry through a guided chat experience.

## How It Works

When a user wants to register an agent, guide them through the form in chat — conversational, not a wall of questions.

### Step 1: Collect Info (Conversational Prefill)

Walk through these sections naturally. Group related fields together.

#### Section A: Basic Info (ask first)
| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| **Agent Name** | ✅ | — | Display name |
| **Agent Address** | auto | from `.env` | Wallet address (derived from private key) |
| **Description** | ✅ | — | What the agent does (1-3 sentences) |
| **Image** | No | — | Avatar/profile image URL |
| **Version** | No | `1.0.0` | Agent version |
| **Author** | No | — | Creator name or handle |
| **License** | No | `MIT` | Software license |

#### Section B: Endpoints (ask second)
| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| **A2A Endpoint** | No | — | Agent-to-Agent messaging URL |
| **MCP Endpoint** | No | — | Model Context Protocol URL |

#### Section C: Skills & Domains (ask third)
| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| **Selected Skills** | No | `[]` | OASF taxonomy skills (e.g. "Natural Language Processing", "Code Generation") |
| **Selected Domains** | No | `[]` | OASF taxonomy domains (e.g. "Technology", "Finance") |
| **Custom Skills** | No | `[]` | Non-standard skills the agent has |
| **Custom Domains** | No | `[]` | Non-standard domains the agent operates in |

Common skills to suggest: Natural Language Processing, Summarization, Question Answering, Code Generation, Data Analysis, Web Search, Image Generation, Translation, Task Automation

Common domains to suggest: Technology, Finance, Healthcare, Education, Entertainment, Science, Creative Arts, Developer Tools, Blockchain/Web3

#### Section D: Advanced Config (ask last, offer defaults)
| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| **Supported Trusts** | No | `[]` | Trust models: `reputation`, `crypto-economic`, `tee-attestation` |
| **x402 Support** | No | `false` | Payment protocol support |
| **Storage Method** | No | `http` | `http` (fully onchain) or `ipfs` |
| **Active** | No | `true` | Is the agent active? |

### Step 2: Show Draft

After collecting all info, display the complete registration:

```
📋 Agent Registration Draft

  ── Basic Info ──
  Name:        MyAgent
  Address:     0x1234...abcd
  Description: A helpful AI assistant
  Image:       https://example.com/avatar.png
  Version:     1.0.0
  Author:      0xdas
  License:     MIT

  ── Endpoints ──
  A2A:         https://example.com/a2a
  MCP:         (none)

  ── Skills & Domains ──
  Skills:      Natural Language Processing, Code Generation
  Domains:     Technology, Developer Tools
  Custom:      (none)

  ── Config ──
  Chain:       Base (8453)
  Storage:     Fully onchain
  Active:      true
  x402:        false
  Trust:       reputation

Ready to register on-chain?
```

If platform supports inline buttons, offer:
- ✅ **Register** — submit on-chain
- ✏️ **Edit** — change a field
- ❌ **Cancel** — abort

### Step 3: Execute

Only after explicit confirmation, run:

```bash
source /path/to/.env
node scripts/register.mjs --json /tmp/registration.json --chain 8453 --yes
```

The script accepts the full 8004.org JSON template format via `--json`.

### Step 4: Report Result

Show the user:
- Agent ID (e.g., `8453:42`)
- Wallet address (set automatically)
- Transaction hash
- Link to view on 8004.org

## JSON Template Format

The registration uses the standard 8004.org export format:

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

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` / `AGENT_PRIVATE_KEY` / `MAIN_WALLET_PRIVATE_KEY` | Yes | Wallet private key |
| `RPC_URL` | No | Custom RPC (auto-detected per chain) |
| `CHAIN_ID` | No | Default chain (8453) |

## Conversation Flow Tips

- **Auto-detect what you can** — wallet from `.env`, don't ask for it
- **Group related fields** — ask basics first, then endpoints, then skills, then advanced
- **Offer sensible defaults** — most users just need name + description + maybe A2A
- **Suggest common skills/domains** — show a list they can pick from
- **Advanced config last** — most users keep defaults, offer to skip
- **Always show draft** before submitting
- **Never run with `--yes` until user confirms the draft**

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
