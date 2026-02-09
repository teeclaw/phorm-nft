---
name: erc8004
description: ERC-8004 agent registration, search, update, and feedback using the Agent0 TypeScript SDK (agent0-sdk v1.5.2)
---

# ERC-8004 Agent Registration Skill

Register, search, update, and provide feedback on AI agents using the [ERC-8004](https://8004.org) on-chain registry via the `agent0-sdk`.

## Supported Chains (mainnet only)

| Chain | ID | Default |
|-------|-----|---------|
| **Base** | 8453 | ✅ Default |
| Ethereum | 1 | |
| Polygon | 137 | |
| BNB Chain | 56 | |
| Arbitrum | 42161 | |
| Celo | 42220 | |
| Gnosis | 100 | |
| Scroll | 534352 | |

All chains share the same contract addresses. **No testnets supported.**

See `references/chains.md` for full chain details and RPC URLs.

## Setup

```bash
bash skills/erc8004/scripts/setup.sh
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PRIVATE_KEY` or `AGENT_PRIVATE_KEY` | Yes | — | Wallet private key for signing transactions |
| `RPC_URL` | No | Auto (per chain) | Chain RPC endpoint |
| `CHAIN_ID` | No | `8453` (Base) | Target chain ID |
| `PINATA_JWT` | No | — | Pinata JWT for IPFS pinning |

Set these in your shell or `/home/phan_harry/.openclaw/.env`.

## Usage

### Register an Agent

```bash
node skills/erc8004/scripts/register.mjs \
  --name "MyAgent" \
  --description "An AI assistant" \
  --storage ipfs \
  --chain 8453
```

Options: `--name`, `--description`, `--image <url>`, `--a2a <url>`, `--mcp <url>`, `--chain <id>`, `--storage ipfs|http`, `--dry-run`, `--yes`

### Search Agents

```bash
node skills/erc8004/scripts/search.mjs --name "MyAgent" --chain 8453
```

Options: `--name`, `--chain`, `--active`, `--skills <csv>`, `--tools <csv>`

### Update Agent

```bash
node skills/erc8004/scripts/update.mjs --agent-id "8453:42" --name "NewName"
```

Options: `--agent-id <chainId:id>`, `--name`, `--description`, `--image`, `--a2a`, `--mcp`, `--yes`

### Give Feedback

```bash
node skills/erc8004/scripts/feedback.mjs --agent-id "8453:42" --value 5 --tag1 "reliable"
```

Options: `--agent-id`, `--value <1-5>`, `--tag1`, `--tag2`, `--yes`

## Safety

All on-chain transactions show a **DRAFT/PREVIEW** and require confirmation before execution (bypass with `--yes`).

## References

- `references/sdk-reference.md` — SDK API quick reference
- `references/chains.md` — Supported chains and contract addresses
