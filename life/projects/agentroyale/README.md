# AgentRoyale

## Snapshot
- Status: active (AgentRoyale v2 production cutover complete on Vercel + Supabase)
- Goal: Run AgentRoyale game flows with reliable API + settlement paths.
- Current focus: keep onchain settlement stable under KMS signing and preserve 1:1 legacy frontend behavior.

## What matters now
- Canonical public API endpoint is `https://www.agentroyale.xyz/api`.
- Read/write path is running via Vercel Functions + Supabase (`/api/*`).
- Serverless signing path uses KMS (`USE_KMS=true`) with service-account OAuth fallback and readiness checks on `/api/health`.
- Default settlement mode is `onchain-settle` with test-agent key flow removed.
- Production settlement proof (open/fund/close):
  - `0x93a9b24a0901d169616ef2335100620c82c86907bd605ff023d449fc42e28d78`
  - `0x3a26849cad1170140d905eb8a37230b6adf52d61c0f6abd629f1c1b7a277efef`
  - `0xc333533b3bec56cacb63b351f14e48e38e19eb008bfb50bbd10c5f3bab3a13fa`

## Next 3 actions
1. Keep clients/integrations pinned to `https://www.agentroyale.xyz/api`.
2. Monitor close-channel settlement finalization (`settledOnchain=true`) after nonce-signing fix.
3. Keep frontend output aligned with strict 1:1 legacy HTML rendering requirement.

## Key links
- Canonical API: https://www.agentroyale.xyz/api
- Repo: https://github.com/teeclaw/agent-casino
