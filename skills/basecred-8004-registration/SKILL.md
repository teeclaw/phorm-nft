---
name: basecred-8004-registration
description: Interactive ERC-8004 agent registration via chat. Guides users through a prefill form, shows draft, confirms, then registers on-chain using agent0-sdk.
---

# Basecred ERC-8004 Registration

Register AI agents on the [ERC-8004](https://8004.org) on-chain registry through a guided chat experience. No CLI knowledge needed — the agent walks you through it.

## How It Works

When a user wants to register an agent, **do NOT run the script immediately**. Instead, guide them through the registration form in chat:

### Step 1: Collect Info (Conversational Prefill)

Ask the user for each field, one or two at a time. Use natural conversation, not a wall of questions.

**Required fields:**
1. **Agent Name** — What's your agent called?
2. **Description** — What does your agent do? (1-2 sentences)

**Optional fields (offer after required):**
3. **Image URL** — Avatar/profile image URL
4. **A2A Endpoint** — Agent-to-Agent messaging URL
5. **MCP Endpoint** — Model Context Protocol URL
6. **Chain** — Which chain? (default: Base)
7. **Active** — Is the agent active? (default: yes)
8. **x402 Support** — Supports payment protocol? (default: no)
9. **Metadata** — Any custom key-value pairs?

**Auto-detected (don't ask, just use):**
- **Wallet Address** — derived from the private key in `.env`
- **Storage** — fully onchain (http) by default

### Step 2: Show Draft

After collecting info, display a clean summary:

```
📋 Agent Registration Draft

  Name:        MyAgent
  Description: A helpful AI assistant
  Image:       https://example.com/avatar.png
  Wallet:      0x1234...abcd
  A2A:         https://example.com/a2a
  Chain:       Base (8453)
  Storage:     Fully onchain

Ready to register?
```

If the platform supports inline buttons, offer:
- ✅ **Register** — submit on-chain
- ✏️ **Edit** — change a field
- ❌ **Cancel** — abort

### Step 3: Execute

Only after explicit confirmation, run the registration script:

```bash
source /path/to/.env
node scripts/register.mjs \
  --name "AgentName" \
  --description "Description" \
  --a2a "https://..." \
  --image "https://..." \
  --chain 8453 \
  --yes
```

### Step 4: Report Result

Show the user:
- Agent ID (e.g., `8453:42`)
- Wallet address (set automatically)
- Transaction confirmation
- Link to view on 8004.org

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

## Conversation Examples

**User:** "I want to register my agent on ERC-8004"

**Agent:** "Let's get your agent registered on-chain! First — what's your agent's name?"

**User:** "CoolBot"

**Agent:** "Nice. And what does CoolBot do? Give me a short description."

**User:** "It helps developers debug smart contracts"

**Agent:** "Got it. Do you have any of these? (all optional)
- Profile image URL
- A2A endpoint
- MCP endpoint

Or we can skip and register with just the basics."

**User:** "A2A is https://coolbot.xyz/a2a, skip the rest"

**Agent:**
```
📋 Agent Registration Draft

  Name:        CoolBot
  Description: Helps developers debug smart contracts
  Wallet:      0xabc...def
  A2A:         https://coolbot.xyz/a2a
  Chain:       Base (8453)
  Storage:     Fully onchain

Ready to register on-chain? ✅
```

## Safety

- **Always show draft before submitting**
- **Always wait for explicit confirmation**
- **Never run with `--yes` until user confirms the draft**
- Wallet is set automatically after mint (EIP-712 signature)
- All transactions are on mainnet — no testnets

## Setup

```bash
bash scripts/setup.sh
```

Installs `agent0-sdk` and validates environment.
