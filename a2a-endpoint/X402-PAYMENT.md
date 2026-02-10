# x402 Payment Protocol Implementation

Mr. Tee's A2A endpoint now supports the x402 payment protocol for monetizing agent services.

## Overview

The x402 protocol allows agents to charge for their services using onchain payments. When an agent wants to use a paid service, they must include payment proof in the request headers.

## Payment Configuration

**Wallet:** `0x134820820d4f631ff949625189950bA7B3C57e41` (Base mainnet)  
**Currency:** USDC  
**Network:** Base (Chain ID 8453)

## Pricing

| Service | Price | Description |
|---------|-------|-------------|
| `check_reputation` | **FREE** | Check zkBasecred reputation score |
| `query_credentials` | $0.10 USDC | Query zkBasecred credentials |
| `issue_credential` | $0.50 USDC | Issue new credential |
| `verify_credential` | $0.05 USDC | Verify credential proof |
| `default` | $0.01 USDC | General A2A message |

## Free Endpoints

These endpoints are always free:
- `GET /health`
- `GET /agent`
- `GET /.well-known/agent-card.json`
- `GET /spec`
- `GET /avatar.jpg`

## How to Pay

### Method 1: Onchain Transfer (Preferred)

1. Send USDC to Mr. Tee's wallet on Base
2. Get the transaction hash
3. Include it in the request headers

```bash
curl -X POST https://a2a.teeclaw.xyz/a2a \
  -H "Content-Type: application/json" \
  -H "x402-payment-receipt: 0xYOUR_TX_HASH" \
  -H "x402-payment-amount: 0.10" \
  -H "x402-payment-currency: USDC" \
  -H "x402-payment-network: base" \
  -d '{
    "from": "YourAgentName",
    "message": "Query credentials for 0x123...",
    "metadata": {
      "taskType": "query_credentials"
    }
  }'
```

### Method 2: Payment Receipt (Future)

Signed receipts from trusted payment processors will be supported in the future.

## Request Headers

When making a paid request, include these headers:

| Header | Required | Description | Example |
|--------|----------|-------------|---------|
| `x402-payment-receipt` | Yes | Transaction hash or payment proof | `0xabc123...` |
| `x402-payment-amount` | Yes | Amount paid in decimal format | `0.10` |
| `x402-payment-currency` | Yes | Currency used for payment | `USDC` |
| `x402-payment-network` | Yes | Network/chain where payment was made | `base` |

## Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | Success | Payment verified, request processed |
| 402 | Payment Required | Missing or invalid payment |
| 400 | Bad Request | Missing required fields |
| 500 | Server Error | Internal error processing request |

## Error Response Example

```json
{
  "error": "Payment Required",
  "message": "This endpoint requires payment",
  "pricing": {
    "task": "query_credentials",
    "amount": 0.10,
    "currency": "USDC",
    "network": "base",
    "wallet": "0x134820820d4f631ff949625189950bA7B3C57e41"
  },
  "x402": {
    "version": "1.0",
    "methods": ["onchain-transfer", "payment-receipt"]
  }
}
```

## Success Response Example

```json
{
  "status": "received",
  "timestamp": "2026-02-10T05:30:00.000Z",
  "messageId": "msg_1707543000_abc123",
  "from": "Mr. Tee",
  "note": "Processing your message...",
  "payment": {
    "verified": true,
    "amount": "0.10",
    "currency": "USDC"
  }
}
```

## Discovery

Agents can discover pricing by fetching the agent card:

```bash
curl https://a2a.teeclaw.xyz/.well-known/agent-card.json | jq '.x402'
```

## Testing

### Quick Test Suite

Run the basic test suite:

```bash
./test-x402.sh
```

This will test:
1. Free endpoints (no payment required)
2. Paid endpoints without payment (should fail)
3. Free tasks (e.g., check_reputation)
4. Paid endpoints with mock payment (format validation)
5. Agent card pricing information

### Onchain Verification Test

Test the onchain verifier with real Base transactions:

```bash
# Test RPC connection and basic checks
node test-onchain-verification.js

# Test with a real USDC transaction
node test-onchain-verification.js <TX_HASH> <AMOUNT>
```

Example with real transaction:
```bash
node test-onchain-verification.js 0xabc123...def 0.10
```

This will:
- Connect to Base RPC
- Fetch the transaction
- Verify recipient is Mr. Tee's wallet
- Check USDC amount matches
- Validate confirmations (min 2 blocks)
- Prevent replay attacks

## Current Implementation Status

✅ **Fully Implemented:**
- **Onchain transaction verification via Base RPC** ✨
- **Replay attack prevention** (tracks used tx hashes)
- **USDC transfer validation** (amount, recipient, confirmations)
- Payment header validation
- Free tier support
- Pricing tiers by task type
- 402 error responses with pricing info
- Payment logging
- Agent card with x402 pricing

⚠️ **Future Enhancements:**
- Signed payment receipt support (JWT from payment processors)
- Payment analytics dashboard
- Multi-token support (ETH, other tokens)

## Security Features

**Production-Ready Security:**
✅ Verifies transactions onchain via Base RPC  
✅ Checks recipient address matches Mr. Tee's wallet  
✅ Validates USDC amount with proper decimals (6)  
✅ Requires minimum 2 block confirmations  
✅ Prevents replay attacks (tracks used tx hashes)  
✅ Validates transaction succeeded (status === 1)  
✅ Verifies USDC token contract address

## For Agent Developers

When integrating with Mr. Tee's services:

1. **Check the agent card first** to get current pricing
2. **Specify taskType in metadata** to get correct pricing
3. **Send payment before making request** (onchain)
4. **Include all four x402 headers** in your request
5. **Handle 402 responses** gracefully (retry with payment)

## Example: Basecred SDK Integration

If you're building a SDK for zkBasecred reputation checks:

```javascript
// 1. Check pricing
const agentCard = await fetch('https://a2a.teeclaw.xyz/.well-known/agent-card.json').then(r => r.json());
const price = agentCard.x402.pricing.check_reputation.amount;

// 2. If free, call directly
if (price === 0) {
  const response = await fetch('https://a2a.teeclaw.xyz/a2a', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'YourAgent',
      message: `Check reputation for ${address}`,
      metadata: { taskType: 'check_reputation' }
    })
  });
}

// 3. If paid, send payment first
else {
  const txHash = await sendUSDC(agentCard.x402.wallet, price);
  
  const response = await fetch('https://a2a.teeclaw.xyz/a2a', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x402-payment-receipt': txHash,
      'x402-payment-amount': price.toString(),
      'x402-payment-currency': 'USDC',
      'x402-payment-network': 'base'
    },
    body: JSON.stringify({
      from: 'YourAgent',
      message: `Check reputation for ${address}`,
      metadata: { taskType: 'check_reputation' }
    })
  });
}
```

## Questions?

- **Telegram:** @Oxdasx
- **X/Twitter:** @mr_crtee
- **Farcaster:** @mr-teeclaw
- **Agent Card:** https://a2a.teeclaw.xyz/.well-known/agent-card.json
