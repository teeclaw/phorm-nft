# x402 Reputation Server

Payment-gated onchain reputation API powered by [Basecred SDK](https://github.com/teeclaw/basecred-sdk) and the [x402 protocol](https://www.x402.org/).

**Live:** https://x402.teeclaw.xyz

## Endpoints

| Endpoint | Price | Description |
|----------|-------|-------------|
| `GET /health` | Free | Server status and endpoint listing |
| `GET /reputation?address=0x...` | Free | Summary scores (Ethos, Talent, Farcaster, recency) |
| `GET /reputation/full?address=0x...` | $5.00 USDC | Full profile with all source data |

## How It Works

1. **Free tier** — `/reputation` returns aggregated scores from Ethos Network, Talent Protocol, and Farcaster (via Neynar)
2. **Paid tier** — `/reputation/full` requires a $5 USDC payment on Base via x402. The server returns a `402 Payment Required` with payment instructions; your x402 client signs the payment and retries

## Quick Start

```bash
# Install
pnpm install

# Configure (needs .env with API keys)
cp .env.example .env

# Run
pnpm start

# Test
node test-suite.mjs          # full suite (needs WALLET_PRIVATE_KEY for paid test)
node test-suite.mjs --dry-run # skip payment tests
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `WALLET_PRIVATE_KEY` | For tests | Wallet private key (for x402 payment signing) |
| `AGENT_WALLET` | No | Payment recipient address (default: hardcoded) |
| `X402_PORT` | No | Server port (default: 4021) |
| `TALENT_API_KEY` | No | Talent Protocol API key |
| `NEYNAR_API_KEY` | No | Neynar (Farcaster) API key |

## Data Sources

- **Ethos Network** — On-chain review score and review count
- **Talent Protocol** — Builder score, creator score, levels
- **Farcaster/Neynar** — User quality score and threshold check
- **Recency** — Activity recency bucket

## Deployment

Runs as a systemd service (`x402-server.service`) behind Caddy reverse proxy.

```bash
# Install service
sudo cp x402-server.service /etc/systemd/system/
sudo systemctl enable --now x402-server

# Caddy already configured at x402.teeclaw.xyz → localhost:4021
```

## Stack

- Express + x402 middleware
- @basecred/sdk for reputation aggregation
- @coinbase/x402 facilitator for payment verification
- Base mainnet (eip155:8453) / USDC

## License

MIT
