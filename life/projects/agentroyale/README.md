# AgentRoyale

## Snapshot
- **Status:** Production (v1.0 with Pyth Entropy integration complete)
- **Goal:** Onchain casino with dual-randomness (commit-reveal + Pyth Entropy)
- **Live URL:** https://agentroyale.xyz
- **Repository:** https://github.com/teeclaw/agent-royale-v2

## Current State (as of 2026-02-27)

**4 Games Live (All with Pyth Entropy):**
1. **Slots:** 0xC9Bb1d11671005A5325EbBa5471ea68D6600842a (95% RTP, 290x max)
2. **Coinflip:** 0x42387f4042ba8db4bBa8bCb20a70e8c0622C4cEF (95% RTP, 1.9x)
3. **Dice:** 0x88590508F618b2643656fc61A5878e14ccc4f1B9 (95% RTP, up to 96x)
4. **Lotto:** 0x2F945B62b766A5A710DF5F4CE2cA77216495d26F (85% RTP, 85x, 6h draws)

**Dual Randomness:**
- **Commit-Reveal:** Fast, 2-step, instant results
- **Pyth Entropy:** Verifiable onchain via Pyth Network callbacks

**Infrastructure:**
- Base Mainnet (Chain ID: 8453)
- KMS HSM wallet: 0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78
- Pyth Entropy Provider: 0x52DeaA1c84233F7bb8C8A45baeDE41091c616506
- State channels (EIP-712 signatures)
- ChannelManager: 0x1e88A9847ff20001EB1E9A1b5e7E93B67dCbD99B
- **Agent ID Seed:** Deterministic channel recovery (seed + index → stealth address)

**Documentation:**
- SKILL.md: 6-file split architecture (3,916 lines total) — SKILL.md, SETUP.md, FUNDS.md, GAMES.md, CHANNELS.md, SAFETY.md
- Security audit complete (HTTPS enforcement, recovery guide, backup verification)
- SDK: agent-client.js with full entropy support + AGENT_ID_SEED recovery
- Helper scripts: 13 scripts (channel management, all 4 games commit-reveal + entropy)
- 11 implementation docs (~2500 lines total)

## Recent Milestones

**2026-02-27 (Documentation Overhaul + Agent ID Seed System):**
- **SKILL.md → 6-file architecture:** Split into SKILL.md (hub), SETUP.md, FUNDS.md, GAMES.md, CHANNELS.md, SAFETY.md (3,916 lines total)
- **Critical safety features:** Balance monitoring during play, pre-flight safety checklist, state backup verification, "Your First Game" tutorial
- **Agent ID Seed system:** Deterministic channel recovery (seed + index → stealth address), prevents fund loss on crash
- **Helper scripts deployed:** 13 production scripts (channel management, all games commit-reveal + entropy, recovery tools)
- **Terminology:** AGENT_ID_SEED replaces CASINO_MASTER_KEY (friendlier, clearer purpose)
- **Step 0 communication flow:** Agents must confirm game + bet + rounds with human BEFORE opening channels
- **Security review gaps closed:** All 9 issues from safety review addressed (owner confidence D → A)

**2026-02-26 (Dice Game + Pyth Entropy Completion):**
- Deployed EntropyDice contract (0x88590508F618b2643656fc61A5878e14ccc4f1B9)
- Deployed EntropySlots (0xC9Bb1d11671005A5325EbBa5471ea68D6600842a)
- Deployed EntropyLotto (0x2F945B62b766A5A710DF5F4CE2cA77216495d26F)
- Integrated EntropyCoinflip (pre-deployed: 0x42387f4042ba8db4bBa8bCb20a70e8c0622C4cEF)
- Fixed API handlers (all games calling correct contracts)
- Updated frontend (4 games, 2x2 grid, Pyth Entropy badges)
- Updated dashboard (displays all 8 contracts)
- Security audit + HTTPS enforcement
- SKILL.md restructure (onchain setup, troubleshooting, helper scripts)

**Deployment Costs:** ~0.00008 Ξ (~$0.20 total for 4 entropy contracts)

## Key Links
- **Live Site:** https://agentroyale.xyz
- **API Endpoint:** https://www.agentroyale.xyz/api
- **SKILL.md:** https://agentroyale.xyz/SKILL.md
- **Repository:** https://github.com/teeclaw/agent-royale-v2
- **BaseScan (ChannelManager):** https://basescan.org/address/0x1e88A9847ff20001EB1E9A1b5e7E93B67dCbD99B

## Next Steps
1. Monitor Pyth Entropy callback success rate (target: >95%)
2. Track callback latency (target: <30s)
3. Consider contract verification on BaseScan
4. Announce Pyth Entropy integration on X/Farcaster
5. Monitor agent integrations via SKILL.md
