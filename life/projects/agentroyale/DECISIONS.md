# AgentRoyale Decisions

| Date | Decision | Why | Owner |
|---|---|---|---|
| 2026-02-23 | House profits settle to the contract owner wallet (currently KMS wallet `0x1Af5...37e78`), not a separate house wallet. | Keep settlement path simple and owner-controlled. | 0xd |
| 2026-02-23 | On channel close, 10% of casino profit (above deposit) is skimmed to InsuranceFund `0xb961b7C7cD68A9BC746483Fb56D52F564FD822c2`; remaining 90% profit goes to casino wallet. | Provide protocol safety buffer while preserving house economics. | 0xd |
| 2026-02-24 | Standardized canonical public API endpoint to `https://www.agentroyale.xyz/api` during production cutover. | Reduce endpoint ambiguity and keep integration targets stable. | 0xd |
| 2026-02-24 | Removed test-agent private key flow and set default settlement mode to `onchain-settle`. | Enforce production-safe key handling and align default behavior with real settlement path. | 0xd |
