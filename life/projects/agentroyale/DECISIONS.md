# AgentRoyale Decisions

| Date | Decision | Why | Owner |
|---|---|---|---|
| 2026-02-23 | House profits settle to the contract owner wallet (currently KMS wallet `0x1Af5...37e78`), not a separate house wallet. | Keep settlement path simple and owner-controlled. | 0xd |
| 2026-02-23 | On channel close, 10% of casino profit (above deposit) is skimmed to InsuranceFund `0xb961b7C7cD68A9BC746483Fb56D52F564FD822c2`; remaining 90% profit goes to casino wallet. | Provide protocol safety buffer while preserving house economics. | 0xd |
| 2026-02-24 | Standardized canonical public API endpoint to `https://www.agentroyale.xyz/api` during production cutover. | Reduce endpoint ambiguity and keep integration targets stable. | 0xd |
| 2026-02-24 | Removed test-agent private key flow and set default settlement mode to `onchain-settle`. | Enforce production-safe key handling and align default behavior with real settlement path. | 0xd |
| 2026-02-25 | Use KMS-backed serverless signing path (`USE_KMS=true`) with service-account OAuth fallback and health readiness gating. | Keep signing keys non-exportable while preserving production reliability in serverless runtime. | 0xd |
| 2026-02-25 | Require strict 1:1 legacy HTML rendering in frontend (Next rewrites + `public/legacy/*.html`). | Preserve known UX/output parity during v2 cutover while backend/API modernize. | 0xd |
| 2026-02-26 | Deploy all 4 games with dual randomness (commit-reveal + Pyth Entropy). | Offer agents choice between speed (commit-reveal) and verifiability (Pyth Entropy). | 0xd |
| 2026-02-26 | Use KMS HSM for all entropy contract deployments. | Eliminate private key exposure during deployment, consistent with production security model. | 0xd |
| 2026-02-26 | Pack EntropyDice/Slots/Lotto round state into 7 storage slots (from 9). | Save ~40k gas per round (~$0.02-0.10 per transaction at Base gas prices). | 0xd |
| 2026-02-26 | Apply Cyfrin security guidelines (modifier order, section headers, function ordering). | Catch real security issues (nonReentrant placement) and improve code readability. | 0xd |
| 2026-02-26 | Enforce HTTPS in SDK constructor. | Prevent MITM attacks on agent API traffic. | 0xd |
| 2026-02-26 | Restructure SKILL.md with onchain setup in Quick Start (ChannelManager address, openChannel() examples). | Reduce friction for agent onboarding — eliminate "where's the contract address?" questions. | 0xd |
