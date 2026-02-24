# AgentRoyale

## Snapshot
- Status: active (Vercel + Supabase cutover in production)
- Goal: Run AgentRoyale game flows with reliable API + settlement paths.
- Current focus: stabilize canonical API endpoint and onchain settlement operations.

## What matters now
- Canonical public API endpoint is `https://www.agentroyale.xyz/api`.
- Read/write path is running via Vercel Functions + Supabase (`/api/*`).
- Migration backfill baseline: channels=10, rounds=7, events=20, gameStats=3.
- Default settlement mode is `onchain-settle` with test-agent key flow removed.

## Next 3 actions
1. Keep clients/integrations pinned to `https://www.agentroyale.xyz/api` until DNS/routing is fully unified.
2. Monitor onchain settlement reliability from open/fund/close through final channel settlement.
3. Document/automate operational checks for post-cutover regressions.

## Key links
- Canonical API: https://www.agentroyale.xyz/api
- Repo: https://github.com/teeclaw/agent-casino
