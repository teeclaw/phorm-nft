# ERC-8004 Metadata Update - Execution Plan

## Summary
Update Agent ID 14482 metadata on Base to reflect correct payment wallet separation.

## Changes

### 1. Added x402 Payment Configuration
```json
"x402": {
  "enabled": true,
  "wallet": "0xFdF53De20f46bAE2Fa6414e6F25EF1654E68Acd0",
  "network": "base",
  "chainId": 8453,
  "currency": "USDC",
  "pricing": {
    "check_reputation": { "amount": 0, ... },
    "query_credentials": { "amount": 0.1, ... },
    "issue_credential": { "amount": 0.5, ... },
    "verify_credential": { "amount": 0.05, ... },
    "default": { "amount": 0.01, ... }
  },
  "methods": ["onchain-transfer", "payment-receipt"]
}
```

### 2. Updated agentWallet Service
**Before:** `eip155:8453:0x134820820d4f631ff949625189950bA7B3C57e41`  
**After:** `eip155:8453:0xFdF53De20f46bAE2Fa6414e6F25EF1654E68Acd0` (Treasury)

### 3. Added operationalWallet Service
**New:** `eip155:8453:0x134820820d4f631ff949625189950bA7B3C57e41` (Operational)

## Transaction Details

**Chain:** Base (8453)  
**Contract:** `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` (Identity Registry)  
**Function:** `setAgentURI(uint256 agentId, string memory newURI)`  
**Agent ID:** 14482  
**From (Signer):** `0x134820820d4f631ff949625189950bA7B3C57e41` (NFT Owner)  
**Value:** 0 ETH  
**Estimated Gas:** ~0.0005 ETH (~$0.50 USD)

## Files Generated

1. `updated-8004-metadata.json` - New metadata (3.8 KB)
2. `updated-8004-datauri.txt` - Data URI (5.1 KB)
3. `setAgentURI-calldata.txt` - Transaction calldata (10.5 KB)

## Execution Command

```bash
# Via Bankr (recommended)
~/openclaw/skills/bankr/scripts/bankr.sh "Submit this transaction on Base: {\"to\": \"0x8004A169FB4a3325136EB29fA0ceB6D2e539a432\", \"data\": \"$(cat setAgentURI-calldata.txt)\", \"value\": \"0\", \"chainId\": 8453}"
```

## Verification Steps

After transaction confirms:

1. Check on 8004agents.ai:
   - https://8004agents.ai/base/agent/14482

2. Query tokenURI on-chain:
   ```bash
   cast call 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432 \
     "tokenURI(uint256)(string)" 14482 \
     --rpc-url https://mainnet.base.org
   ```

3. Verify agent-card matches:
   ```bash
   curl https://a2a.teeclaw.xyz/.well-known/agent-card.json | jq .x402.wallet
   # Should return: "0xFdF53De20f46bAE2Fa6414e6F25EF1654E68Acd0"
   ```

## Rollback

If needed, can update again with previous metadata. No risk to agent functionality.

## Ready to Execute

All files prepared in: `/home/phan_harry/.openclaw/workspace/a2a-endpoint/`

Awaiting approval to submit via Bankr.
