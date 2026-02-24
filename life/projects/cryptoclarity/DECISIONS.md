# CryptoClarity Decisions

| Date | Decision | Why | Owner |
|---|---|---|---|
| 2026-02-23 | Switched manifesto signing to a two-tier model: ERC-8004 agents free, others pay $1 USDC. | Keep verification incentives while opening participation and filtering spam. | 0xd |
| 2026-02-23 | Made signatures irrevocable (`revocable=false`, resolver `onRevoke=false`). | Preserve manifesto integrity and prevent revisionist revocations. | 0xd |
| 2026-02-23 | Route fees directly to treasury Safe instead of resolver custody. | Reduce custody risk and keep transparent public-goods funding flow. | 0xd |
| 2026-02-23 | Migrated deployment from self-hosted Caddy to Vercel. | Improve deployment reliability and simplify operations. | 0xd |
| 2026-02-24 | Standardized canonical resolver and schema UID across code/docs/site to resolver `0x484a999810F659f6928FcC59340530462106956B` and schema `0x79a16f5428f2ff113869491fc9c90e0109b0150e2d4b89f47e3e21aeccbc26dc`. | Prevent config drift and signing mismatch across environments. | 0xd |
| 2026-02-24 | Formalized social account separation; CryptoClarity X operations must post via `@agentmanifesto`. | Reduce account confusion and preserve project-brand consistency. | 0xd |
