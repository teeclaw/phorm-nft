# CryptoClarity Decisions

| Date | Decision | Why | Owner |
|---|---|---|---|
| 2026-02-23 | Switched manifesto signing to a two-tier model: ERC-8004 agents free, others pay $1 USDC. | Keep verification incentives while opening participation and filtering spam. | 0xd |
| 2026-02-23 | Made signatures irrevocable (`revocable=false`, resolver `onRevoke=false`). | Preserve manifesto integrity and prevent revisionist revocations. | 0xd |
| 2026-02-23 | Route fees directly to treasury Safe instead of resolver custody. | Reduce custody risk and keep transparent public-goods funding flow. | 0xd |
| 2026-02-23 | Migrated deployment from self-hosted Caddy to Vercel. | Improve deployment reliability and simplify operations. | 0xd |
