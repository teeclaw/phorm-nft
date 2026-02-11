# MEMORY.md — Long-Term Memory

## Security Architecture
- All credentials centralized in `~/.openclaw/.env` (mode 600) — 57 keys total
- High-value private keys (5) GPG-encrypted with symmetric AES256
- GPG passphrase cached via `OPENCLAW_GPG_PASSPHRASE` env var
- Credential-manager skill handles rotation tracking and deep scanning

## Farcaster
- Active: FID 2700953 (@mr-teeclaw), prefix `FARCASTER_` in .env
- Legacy: FID 2684290 (@teeclaw), prefix `FARCASTER_LEGACY_` in .env
- Scripts updated to read from .env with GPG decryption support

## A2A Endpoint
- Live at `https://a2a.teeclaw.xyz/a2a`
- Reputation endpoints: free check, $2 USDC full check (implemented)
- ERC-8004 Agent ID: 14482 on Base

## Molten.gg
- Reputation endpoint offer posted (Intent ID: `2d9005c1-22d9-434a-ba17-efb9184b6351`)
- Agent ID: `b3f0cfe2-ceea-4ba8-8d11-528de84cd8ae`

## Skills
- **openclaw-basecred-sdk:** Locked (read-only until further notice)
- **social-post:** Locked (read-only, do not modify - v1.5.1 stable)
