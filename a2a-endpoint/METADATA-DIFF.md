# ERC-8004 Metadata Changes

## Side-by-Side Comparison

### ❌ CURRENT (On-Chain)

```json
{
  "x402Support": true,
  // ❌ NO x402 configuration object
  
  "services": [
    // ... other services ...
    {
      "name": "agentWallet",
      "endpoint": "eip155:8453:0x134820820d4f631ff949625189950bA7B3C57e41"
      // ❌ Points to operational wallet, not treasury
    }
    // ❌ NO operationalWallet service
  ]
}
```

### ✅ UPDATED (New)

```json
{
  "x402Support": true,
  "x402": {
    // ✅ ADDED: Full payment configuration
    "enabled": true,
    "wallet": "0xFdF53De20f46bAE2Fa6414e6F25EF1654E68Acd0",
    "network": "base",
    "chainId": 8453,
    "currency": "USDC",
    "pricing": {
      "check_reputation": { "amount": 0, "currency": "USDC", "description": "..." },
      "query_credentials": { "amount": 0.1, "currency": "USDC", "description": "..." },
      "issue_credential": { "amount": 0.5, "currency": "USDC", "description": "..." },
      "verify_credential": { "amount": 0.05, "currency": "USDC", "description": "..." },
      "default": { "amount": 0.01, "currency": "USDC", "description": "..." }
    },
    "methods": ["onchain-transfer", "payment-receipt"]
  },
  
  "services": [
    // ... other services ...
    {
      // ✅ UPDATED: Now points to treasury
      "name": "agentWallet",
      "endpoint": "eip155:8453:0xFdF53De20f46bAE2Fa6414e6F25EF1654E68Acd0",
      "description": "Treasury wallet for incoming x402 payments"
    },
    {
      // ✅ ADDED: Operational wallet clarified
      "name": "operationalWallet",
      "endpoint": "eip155:8453:0x134820820d4f631ff949625189950bA7B3C57e41",
      "description": "Operational wallet for outgoing transactions"
    }
  ]
}
```

## What This Fixes

1. **x402 Protocol Compliance**: Other agents can now see your pricing and payment methods
2. **Correct Payment Address**: x402 payments directed to treasury (`0xFdF...Acd0`)
3. **Wallet Clarity**: Separate incoming (treasury) from outgoing (operational) wallets
4. **Agent Discovery**: Proper service endpoints for automated agent-to-agent coordination

## What Stays The Same

- ✅ Name, description, image
- ✅ All social endpoints (Twitter, Farcaster, GitHub, etc.)
- ✅ OASF skills and domains
- ✅ Trust models and registrations
- ✅ Agent ID (14482)
- ✅ NFT ownership (still `0x1348...3e41`)

## Size Comparison

- **Current metadata**: ~2.3 KB
- **Updated metadata**: ~3.8 KB (+1.5 KB for x402 config)
- **Data URI**: 5.1 KB (base64 encoded)
- **Transaction calldata**: 10.5 KB

## Gas Estimate

**Network:** Base  
**Operation:** setAgentURI (string storage update)  
**Estimated Gas:** ~200,000 gas units  
**Cost:** ~0.0005 ETH (~$0.50 USD at current Base gas prices)
