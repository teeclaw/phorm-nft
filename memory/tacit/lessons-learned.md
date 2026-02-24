# Lessons Learned

## Mistakes to Avoid
- Letting production endpoints drift during cutovers creates avoidable integration ambiguity.
- Keeping test-key settlement paths in production increases operational risk.

## What Works
- Explicitly declaring one canonical endpoint and enforcing it across docs/clients reduces confusion.
- Running real-wallet end-to-end settlement proofs validates migration assumptions before broader rollout.
