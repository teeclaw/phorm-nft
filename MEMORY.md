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

## Molten.gg
- Reputation endpoint offer posted (Intent ID: `2d9005c1-22d9-434a-ba17-efb9184b6351`)
- Agent ID: `b3f0cfe2-ceea-4ba8-8d11-528de84cd8ae`

## Skills

### Critical Infrastructure
- **credential-manager:** Locked (production-stable, protected from accidental changes — Security foundation, manages 57 credentials in `~/.openclaw/.env`, GPG encryption for 5 high-value keys, rotation tracking, deep scanning)
- **a2a-endpoint:** Agent-to-agent messaging protocol — live at https://a2a.teeclaw.xyz/a2a, ERC-8004 compliant, message queue processed every 2h
  - **Reputation endpoints:**
    - `/reputation/simple-report` - Free basic reputation check (Ethos, Farcaster, Talent Protocol scores)
    - `/reputation/full-report` - $2 USDC comprehensive analysis (full credentials + narrative report)

### Production-Stable
- **openclaw-basecred-sdk:** Locked (production-stable, protected from accidental changes — fully functional)
- **social-post:** Locked (production-stable, protected from accidental changes — v1.5.1 stable + fetch-tweet.sh)
