# Lessons Learned

## Mistakes to Avoid
- Letting production endpoints drift during cutovers creates avoidable integration ambiguity.
- Keeping test-key settlement paths in production increases operational risk.
- Making changes to `frontend/` when production serves from `public/legacy/` wastes time and causes confusion.
- Assuming root cause without checking data layer (e.g., cache vs missing fallback object).

## What Works
- Explicitly declaring one canonical endpoint and enforcing it across docs/clients reduces confusion.
- Running real-wallet end-to-end settlement proofs validates migration assumptions before broader rollout.
- In nonce-based close flows, always sign the next nonce expected by the contract path; stale nonce signing silently breaks finalization.
- **Always check project architecture first** — missing requirements (like Pyth Entropy) early wastes implementation time.
- **Cyfrin security guidelines catch real issues** — modifier order fix was a genuine security improvement.
- **Storage packing matters** — saved 40k gas per round (~$0.02-0.10 per transaction) with struct optimization.
- **Test coverage is crucial** — 41 comprehensive tests caught all edge cases before deployment.
- **KMS deployment works reliably** — no private key exposure, smooth deployment flow.
- **Systematic pre-launch review catches critical issues** — HTTPS enforcement gap would have caused agent MITM vulnerabilities.
- **Systematic evidence-based investigation > assumption-based debugging** — checking data layer (API response) faster than chasing cache/deployment issues.
