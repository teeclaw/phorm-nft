# x402 Quick Start Guide

Get your autonomous payment agent running in 5 minutes.

## ⚡ Fast Setup

### 1. Environment Variables

Add to `/home/phan_harry/.openclaw/.env`:

```bash
# Your Base wallet private key
WALLET_PRIVATE_KEY=0x...

# Network (base or base-sepolia)
NETWORK=base

# Optional: Server port (defaults to 4021)
X402_PORT=4021
```

### 2. Install Dependencies

```bash
cd /home/phan_harry/.openclaw/workspace
npm install
```

### 3. Start the Server

```bash
npm run x402:server
```

You should see:
```
📺 x402 Server starting...
Network: base
Pay to: 0x134820820d4f631ff949625189950bA7B3C57e41
Port: 4021
✅ x402 server running at http://localhost:4021
```

### 4. Test with Client

Open a new terminal:

```bash
# Full demo (all endpoints)
npm run x402:client http://localhost:4021

# Single request
npm run x402:client http://localhost:4021/api/agent-info
```

## 💰 How Payments Work

### First Request (Free endpoint)
```bash
curl http://localhost:4021/
```
→ Returns server info immediately (no payment required)

### Paid Request (Agent info - $0.001)
```bash
curl http://localhost:4021/api/agent-info
```
→ Returns `402 Payment Required` with payment details

**When using x402 client:**
1. Detects 402 response
2. Automatically pays $0.001 USDC on-chain
3. Retries request with payment proof
4. Returns data

All automatic. No human intervention.

## 🧪 Testing Flow

### Step 1: Check server is running
```bash
curl http://localhost:4021/health
```

Expected:
```json
{
  "status": "ok",
  "timestamp": "2026-02-09T14:40:00.000Z",
  "network": "base"
}
```

### Step 2: Try a free endpoint
```bash
curl http://localhost:4021/
```

Expected: Full server info with endpoint list

### Step 3: Try a paid endpoint (manual)
```bash
curl http://localhost:4021/api/agent-info
```

Expected:
```json
{
  "error": "Payment Required",
  "amount": "0.001",
  "currency": "USDC",
  "recipient": "0x134820820d4f631ff949625189950bA7B3C57e41",
  "reference": "..."
}
```

### Step 4: Use x402 client (auto-payment)
```bash
npm run x402:client http://localhost:4021/api/agent-info
```

Expected:
- Client detects 402
- Pays $0.001 USDC automatically
- Returns agent info data

## 🎯 Next Steps

### Make Your Own Endpoints

Edit `x402/server.ts` and add:

```typescript
app.get('/api/my-service',
  x402Express({
    facilitator,
    paymentAmount: '0.05', // $0.05 USDC
    currency: 'USDC',
  }),
  (req, res) => {
    res.json({ 
      service: 'my premium data',
      value: 'high-value content here'
    });
  }
);
```

Restart server and test:
```bash
npm run x402:client http://localhost:4021/api/my-service
```

### Integrate Into Your Agent

```typescript
import { ClientEvmSigner } from '@x402/evm';
import { x402Fetch } from '@x402/fetch';

// In your agent code
const client = new ClientEvmSigner({
  privateKey: process.env.WALLET_PRIVATE_KEY,
  network: 'base',
});

async function getAgentData() {
  const response = await x402Fetch({
    client,
    maxPaymentUsd: 1.0,
  })('http://localhost:4021/api/agent-info');
  
  return await response.json();
}
```

### Deploy to Production

1. **Get a domain:** `x402.yourdomain.com`
2. **Deploy server:** Any VPS/cloud provider
3. **Use HTTPS:** Required for production
4. **Monitor payments:** Check on-chain USDC balance

Example production URL:
```
https://x402.teeclaw.xyz/api/agent-info
```

## 🔒 Security Checklist

- ✅ Never commit `.env` file to git
- ✅ Use separate wallet for testing
- ✅ Set `maxPaymentUsd` limits on client
- ✅ Monitor payment logs regularly
- ✅ Start with testnet (base-sepolia) before mainnet

## 📊 Check Your Balance

### USDC on Base
```bash
# Replace with your address
cast balance --rpc-url https://mainnet.base.org \
  YOUR_ADDRESS \
  --erc20 0x833589fcd6edb6e08f4c7c32d4f71b54bda02913
```

### ETH for Gas
```bash
cast balance --rpc-url https://mainnet.base.org YOUR_ADDRESS
```

Get Base ETH: https://bridge.base.org

## ❓ Troubleshooting

### "Missing WALLET_PRIVATE_KEY"
Add to `.env`:
```bash
WALLET_PRIVATE_KEY=0xyour_private_key_here
```

### "Insufficient funds"
Your wallet needs USDC (for payments) and ETH (for gas)

### Port 4021 already in use
Change port in `.env`:
```bash
X402_PORT=4022
```

### Payment not settling
- Check network is correct (base vs base-sepolia)
- Ensure wallet has enough USDC
- Verify gas balance (ETH on Base)

## 📚 Full Documentation

See [README.md](./README.md) for complete documentation, examples, and advanced usage.

---

*📺 Built on Base | x402 Protocol | Autonomous Payments*
