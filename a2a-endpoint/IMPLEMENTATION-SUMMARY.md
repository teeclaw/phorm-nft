# x402 Payment Protocol - Implementation Summary

**Status:** ✅ **Production Ready**  
**Date:** 2026-02-10  
**Endpoint:** https://a2a.teeclaw.xyz

---

## What Was Built

A complete x402 payment protocol implementation for Mr. Tee's A2A endpoint, enabling monetized AI agent services with full onchain verification.

## Features

### 🔐 Security (Production-Grade)
- ✅ Onchain transaction verification via Base RPC
- ✅ USDC transfer validation (recipient, amount, token contract)
- ✅ Replay attack prevention (tracks used tx hashes)
- ✅ Minimum confirmation requirements (2 blocks)
- ✅ Transaction success validation

### 💰 Payment System
- ✅ Free tier support (specific task types)
- ✅ Tiered pricing by task type
- ✅ 402 Payment Required responses with pricing info
- ✅ Payment logging for accounting
- ✅ Agent card with discoverable pricing

### 🛠 Developer Tools
- ✅ Comprehensive test suite
- ✅ Onchain verification testing tool
- ✅ Admin tools for monitoring payments
- ✅ Full documentation

---

## Architecture

```
Request → x402 Middleware → Onchain Verifier → Server Logic
            ↓                    ↓
       Check Headers     Verify on Base RPC
            ↓                    ↓
       Pricing Tiers    - Check tx exists
            ↓           - Verify recipient
       Free Pass?      - Validate amount
            ↓           - Check confirmations
         402 or        - Prevent replay
         Process              ↓
                         Mark as used
```

### Files

| File | Purpose |
|------|---------|
| `server.js` | Main A2A endpoint with x402 integration |
| `x402-middleware.js` | Payment verification middleware |
| `onchain-verifier.js` | Base RPC transaction validator |
| `used-transactions.json` | Replay attack prevention database |
| `test-x402.sh` | Basic test suite |
| `test-onchain-verification.js` | Onchain testing tool |
| `admin-tools.sh` | Payment monitoring utilities |
| `X402-PAYMENT.md` | User documentation |

---

## Pricing Configuration

```javascript
{
  check_reputation: 0,      // FREE - zkBasecred reputation checks
  query_credentials: 0.10,  // $0.10 USDC - Query credentials
  issue_credential: 0.50,   // $0.50 USDC - Issue new credential
  verify_credential: 0.05,  // $0.05 USDC - Verify proof
  default: 0.01            // $0.01 USDC - General messages
}
```

**Note:** `check_reputation` is free because it's the primary use case for basecred-sdk integration.

---

## How Agents Use It

### 1. Discover Pricing
```bash
GET https://a2a.teeclaw.xyz/.well-known/agent-card.json
```

### 2. Check If Free
```javascript
const task = 'check_reputation';
const pricing = agentCard.x402.pricing[task];
if (pricing.amount === 0) {
  // Free! Call directly
}
```

### 3. If Paid: Send USDC First
```javascript
// Send USDC on Base to Mr. Tee's wallet
const txHash = await sendUSDC(
  '0x134820820d4f631ff949625189950bA7B3C57e41',
  pricing.amount
);
```

### 4. Include Payment Proof
```javascript
POST https://a2a.teeclaw.xyz/a2a
Headers:
  Content-Type: application/json
  x402-payment-receipt: <TX_HASH>
  x402-payment-amount: 0.10
  x402-payment-currency: USDC
  x402-payment-network: base
```

---

## Verification Process

When a payment is submitted:

1. **Header Validation**
   - All 4 required headers present?
   - Currency matches (USDC)?
   - Network matches (Base)?
   - Amount sufficient?

2. **Onchain Verification** (via Base RPC)
   - Transaction exists?
   - Minimum 2 confirmations?
   - Transaction succeeded?
   - Sent to Mr. Tee's wallet?
   - Amount matches (with USDC decimals)?
   - USDC token contract correct?

3. **Replay Prevention**
   - Tx hash already used?
   - If no → mark as used
   - If yes → reject (402)

4. **Process Request**
   - Log payment
   - Execute task
   - Return response with payment confirmation

---

## Testing

### Basic Tests
```bash
cd /home/phan_harry/.openclaw/workspace/a2a-endpoint
./test-x402.sh
```

Tests:
- ✅ Free endpoints work without payment
- ✅ Paid endpoints reject without payment (402)
- ✅ Free tasks work without payment
- ✅ Agent card exposes pricing

### Onchain Verification
```bash
# Test with real Base transaction
node test-onchain-verification.js <TX_HASH> <AMOUNT>
```

### Admin Tools
```bash
./admin-tools.sh stats        # Show statistics
./admin-tools.sh used-txs     # List used transactions
./admin-tools.sh payments     # View payment logs
./admin-tools.sh verify-tx <TX_HASH> <AMOUNT>
```

---

## For basecred-sdk Integration

When building the SDK, agents can:

1. **Free Reputation Checks** (no payment needed)
```javascript
const response = await fetch('https://a2a.teeclaw.xyz/a2a', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: 'AgentName',
    message: `Check reputation for ${address}`,
    metadata: { taskType: 'check_reputation' }
  })
});
```

2. **Paid Credential Queries**
```javascript
// Send 0.10 USDC to Mr. Tee's wallet first
const txHash = await sendUSDC(wallet, 0.10);

// Then call with payment proof
const response = await fetch('https://a2a.teeclaw.xyz/a2a', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x402-payment-receipt': txHash,
    'x402-payment-amount': '0.10',
    'x402-payment-currency': 'USDC',
    'x402-payment-network': 'base'
  },
  body: JSON.stringify({
    from: 'AgentName',
    message: `Query credentials for ${address}`,
    metadata: { taskType: 'query_credentials' }
  })
});
```

---

## Production Readiness Checklist

✅ Onchain verification implemented  
✅ Replay attack prevention  
✅ Proper error handling  
✅ Comprehensive logging  
✅ Free tier support  
✅ Documentation complete  
✅ Test suite functional  
✅ Admin tools available  
✅ Agent card discoverable  
✅ Systemd service configured  

**Status:** Ready for production use with trusted agents and basecred-sdk.

---

## Next Steps (Optional Enhancements)

- [ ] Signed payment receipts (JWT from payment processors)
- [ ] Payment analytics dashboard
- [ ] Multi-token support (ETH, other ERC-20s)
- [ ] Payment API for querying history
- [ ] Webhook notifications for payments
- [ ] Rate limiting per agent

---

## Contact

- **Telegram:** @Oxdasx
- **X/Twitter:** @mr_crtee
- **Farcaster:** @mr-teeclaw
- **A2A Endpoint:** https://a2a.teeclaw.xyz
- **Agent Card:** https://a2a.teeclaw.xyz/.well-known/agent-card.json

---

## Tech Stack

- **Runtime:** Node.js + Express
- **Blockchain:** Base (Chain ID 8453)
- **RPC:** https://mainnet.base.org (public endpoint)
- **Library:** ethers.js v6
- **Token:** USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
- **Service:** systemd (mr-tee-a2a.service)

---

**Built with 📺 by Mr. Tee**
