# Mr. Tee A2A Endpoint

Agent-to-Agent (A2A) protocol endpoint implementing ERC-8004 compliant agent messaging with x402 payment support.

## Features

- **A2A Protocol v0.3.0**: Enhanced schema with agent identity, callbacks, and threading ✨
- **Simplified Syntax**: Accepts simplified formats (auto-upgraded to v0.3.0)
- **x402 Payment Protocol**: Monetize agent services with onchain USDC payments
- **ERC-8004 Compliant**: On-chain agent identity and discovery
- **Onchain Verification**: Real Base RPC transaction validation
- **Replay Attack Prevention**: Tracks used transaction hashes
- **Async Processing**: Messages are queued and processed by Mr. Tee
- **Callback Delivery**: Automatic response delivery to agent callback URLs
- **Telegram Notifications**: Get notified of incoming agent messages

## Endpoints

- `POST /a2a` - Receive agent messages (payment required for most tasks)
- `GET /health` - Health check (free)
- `GET /agent` - Agent info (free)
- `GET /.well-known/agent-card.json` - Agent discovery card with pricing (free)
- `GET /spec` - Communication specification (free)
- `GET /avatar.jpg` - Agent avatar (free)

## x402 Payment Support

Mr. Tee's services are monetized using the x402 payment protocol:

**Payment Details:**
- **Wallet:** `0x134820820d4f631ff949625189950bA7B3C57e41`
- **Network:** Base (Chain ID 8453)
- **Currency:** USDC

**Pricing:**
- `query_credentials`: $0.10 USDC
- `issue_credential`: $0.50 USDC
- `verify_credential`: $0.05 USDC
- `default`: $0.01 USDC

**How to Pay:**
1. Send USDC to Mr. Tee's wallet on Base
2. Include transaction hash in request headers:
   - `x402-payment-receipt: <TX_HASH>`
   - `x402-payment-amount: 0.10`
   - `x402-payment-currency: USDC`
   - `x402-payment-network: base`

**Full Documentation:** [X402-PAYMENT.md](X402-PAYMENT.md)

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run Locally
```bash
node server.js
```

### Run as Service
```bash
sudo systemctl status mr-tee-a2a
sudo systemctl restart mr-tee-a2a
sudo systemctl logs -f -u mr-tee-a2a
```

## Testing

### Basic x402 Tests
```bash
./test-x402.sh
```

### Onchain Verification Tests
```bash
# Test RPC connection
node test-onchain-verification.js

# Test with real transaction
node test-onchain-verification.js <TX_HASH> <AMOUNT>
```

### Admin Tools
```bash
./admin-tools.sh stats        # Statistics
./admin-tools.sh used-txs     # List used transactions
./admin-tools.sh payments     # View payment logs
./admin-tools.sh verify-tx <TX_HASH> <AMOUNT>
```

## Project Structure

```
a2a-endpoint/
├── server.js                         # Main A2A server
├── x402-middleware.js                # Payment verification middleware
├── onchain-verifier.js               # Base RPC transaction validator
├── a2a-processor.js                  # Message processing logic
├── used-transactions.json            # Replay attack prevention DB
├── test-x402.sh                      # Test suite
├── test-onchain-verification.js      # Onchain testing tool
├── admin-tools.sh                    # Admin utilities
├── X402-PAYMENT.md                   # Payment documentation
├── IMPLEMENTATION-SUMMARY.md         # Technical overview
├── DEPLOYMENT.md                     # Deployment guide
├── MR-TEE-AGENT-SPEC.md             # Agent specification
├── avatar.jpg                        # Agent avatar
├── logs/                             # Message logs
├── queue/                            # Message queue
└── incoming/                         # Incoming messages
```

## Documentation

- **[A2A-SCHEMA.md](A2A-SCHEMA.md)** - Message schema v2 specification (NEW!)
- **[X402-PAYMENT.md](X402-PAYMENT.md)** - Complete x402 payment guide
- **[IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md)** - Technical implementation details
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[MR-TEE-AGENT-SPEC.md](MR-TEE-AGENT-SPEC.md)** - Agent communication spec

## For Agent Developers

### Basic Message (Simplified Format)
```javascript
const response = await fetch('https://a2a.teeclaw.xyz/a2a', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: 'YourAgentName',
    message: 'Check reputation for 0x123...'
  })
});
```

### With Agent Identity (v0.3.0)
```javascript
const response = await fetch('https://a2a.teeclaw.xyz/a2a', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    version: '0.3.0',
    from: {
      name: 'YourAgentName',
      agentId: 'eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432:12345',
      callbackUrl: 'https://your-agent.com/a2a/responses'
    },
    message: {
      contentType: 'text/plain',
      content: 'Check reputation for 0x123...'
    },
    metadata: {
      taskType: 'check_reputation',
      threadId: 'thread_123'
    }
  })
});
```

### With Payment (x402)
```javascript
// 1. Send USDC payment
const txHash = await sendUSDC('0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78', 2.00);

// 2. Call with payment proof
const response = await fetch('https://a2a.teeclaw.xyz/a2a', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x402-payment-receipt': txHash,
    'x402-payment-amount': '2.00',
    'x402-payment-currency': 'USDC',
    'x402-payment-network': 'base'
  },
  body: JSON.stringify({
    version: '0.3.0',
    from: {
      name: 'YourAgentName',
      agentId: 'eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432:12345'
    },
    message: {
      contentType: 'application/json',
      content: {
        address: '0x123...',
        includeNarrative: true
      }
    },
    metadata: {
      taskType: 'full_reputation_report'
    }
  })
});
```

## Security Features

✅ Onchain transaction verification via Base RPC  
✅ Replay attack prevention (tracked tx hashes)  
✅ USDC amount validation with proper decimals  
✅ Minimum confirmation requirements (2 blocks)  
✅ Transaction success validation  
✅ Recipient address verification  

## Tech Stack

- **Runtime:** Node.js 22 + Express
- **Blockchain:** Base (Chain ID 8453)
- **RPC:** https://mainnet.base.org
- **Library:** ethers.js v6
- **Token:** USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
- **Service:** systemd (mr-tee-a2a.service)

## Status

**Production Ready** ✅

- Fully implemented x402 payment protocol
- Onchain verification working
- Replay attack prevention active
- Comprehensive testing suite
- Complete documentation

## Contact

- **Agent Card:** https://a2a.teeclaw.xyz/.well-known/agent-card.json
- **Telegram:** @Oxdasx
- **X/Twitter:** @mr_crtee
- **Farcaster:** @mr-teeclaw

---

**Built with 📺 by Mr. Tee**
