# basecred-8004-registration

Interactive ERC-8004 agent registration for [OpenClaw](https://openclaw.ai) agents. Register your AI agent on the [ERC-8004](https://8004.org) on-chain identity registry through a guided chat experience.

## Features

- 🗂️ **Conversational prefill** — auto-fills from agent identity files, `.env`, and context
- 📋 **Full draft preview** — shows all fields with ✅/⚠️ status before submitting
- ✏️ **Inline editing** — tap section buttons to edit specific fields
- 🔘 **Multi-select** — skills, domains, and trust models as toggleable buttons
- ⛓️ **Multi-chain** — Base (default), Ethereum, Polygon, BNB, Arbitrum, Celo, Gnosis, Scroll
- 💾 **Fully onchain** — default storage is on-chain (no IPFS dependency)
- 🔑 **Wallet flexibility** — paste an address or auto-detect from private key
- 🔐 **EIP-712 wallet linking** — automatically sets agent wallet after registration
- 📄 **8004.org compatible** — imports/exports the standard 8004.org JSON template

## Quick Start

### 1. Install

```bash
bash scripts/setup.sh
```

### 2. Set Environment

Add to your `.env`:

```bash
# Required: one of these
PRIVATE_KEY=0x...
# or
AGENT_PRIVATE_KEY=0x...
# or
MAIN_WALLET_PRIVATE_KEY=0x...

# Optional
RPC_URL=https://mainnet.base.org
CHAIN_ID=8453
PINATA_JWT=...  # only for IPFS storage
```

### 3. Register via Chat

Just tell your OpenClaw agent: **"Register me on ERC-8004"**

The agent will:
1. Auto-prefill your info from identity files
2. Explain config defaults
3. Show a full draft with edit buttons
4. Register on-chain after your confirmation

### 4. Register via CLI

```bash
# From JSON template
node scripts/register.mjs --json registration.json --chain 8453 --yes

# From CLI args
node scripts/register.mjs \
  --name "MyAgent" \
  --description "What my agent does" \
  --a2a "https://my-agent.xyz/a2a" \
  --skills "NLP,Code Generation" \
  --domains "Technology,Blockchain" \
  --trust "reputation" \
  --chain 8453 \
  --yes

# Dry run (preview only)
node scripts/register.mjs --json registration.json --dry-run

# Output blank template
node scripts/register.mjs --template
```

## Registration Fields

### Basic Info

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| Agent Name | ✅ | — | Display name |
| Description | ✅ | — | What the agent does |
| Agent Address | No | auto from `.env` | Wallet address |
| Image | No | — | Avatar URL |
| Version | No | `1.0.0` | Agent version |
| Author | No | — | Creator name |
| License | No | `MIT` | Software license |

### Endpoints

| Field | Required | Description |
|-------|----------|-------------|
| A2A Endpoint | No | Agent-to-Agent messaging URL |
| MCP Endpoint | No | Model Context Protocol URL |

### Skills & Domains

| Field | Description |
|-------|-------------|
| Selected Skills | OASF taxonomy (NLP, Summarization, Q&A, Code Gen, etc.) |
| Selected Domains | OASF taxonomy (Blockchain, Technology, Finance, etc.) |
| Custom Skills | Non-standard skills |
| Custom Domains | Non-standard domains |

### Advanced Config

| Field | Default | Options |
|-------|---------|---------|
| Chain | Base (8453) | Ethereum, Polygon, BNB, Arbitrum, Celo, Gnosis, Scroll |
| Storage | Fully onchain | IPFS |
| Trust | — | Reputation, Crypto-Economic, TEE Attestation |
| x402 | Off | On (payment protocol) |
| Active | On | Off (hidden from discovery) |

## Wallet Setup

Two ways to link your wallet:

**Option A: Paste address** — just provide your `0x...` address. Simple, read-only.

**Option B: Private key in `.env`** — wallet auto-detected, can sign transactions, enables EIP-712 wallet linking after registration.

## Other Operations

```bash
# Search agents
node scripts/search.mjs --name "AgentName" --chain 8453

# Update agent
node scripts/update.mjs --agent-id "8453:42" --name "NewName" --yes

# Give feedback
node scripts/feedback.mjs --agent-id "8453:42" --value 5 --tag1 "reliable" --yes
```

## JSON Template

Compatible with [8004.org](https://8004.org) export format:

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

| Chain | ID |
|-------|----|
| **Base** | 8453 (default) |
| Ethereum | 1 |
| Polygon | 137 |
| BNB Chain | 56 |
| Arbitrum | 42161 |
| Celo | 42220 |
| Gnosis | 100 |
| Scroll | 534352 |

All chains share the same ERC-8004 contract addresses (deterministic deployment).

## Tech Stack

- [agent0-sdk](https://github.com/agent0lab/agent0-ts) v1.5.2
- [viem](https://viem.sh) (wallet/chain operations)
- [OpenClaw](https://openclaw.ai) skill system

## License

MIT
