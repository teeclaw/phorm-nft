# x402 Autonomous Payment Agent

Implementation of Base's x402 protocol for autonomous agent payments.

**x402** enables AI agents to autonomously pay for services using USDC on Base network. No API keys, no subscriptions — just instant, automatic payments over HTTP.

## 📺 What is x402?

x402 transforms how agents interact with paid services by embedding payments directly into HTTP requests. Instead of managing API keys or subscriptions, agents pay for exactly what they use, when they use it.

**Key Benefits:**
- ✅ Autonomous economic transactions (agents transact without human intervention)
- ✅ Pay-as-you-go monetization (only pay for what you use)
- ✅ Minimal setup (often just one middleware line)
- ✅ Instant settlement (payments verified on-chain in real-time)

**Documentation:** https://docs.base.org/base-app/agents/x402-agents

## 🚀 Quick Start

### Prerequisites

1. **Base wallet with USDC**
   ```bash
   # Your wallet private key in .env
   WALLET_PRIVATE_KEY=0x...
   # or
   XMTP_WALLET_KEY=0x...
   ```

2. **Network configuration**
   ```bash
   # Add to .env
   NETWORK=base          # or base-sepolia for testnet
   X402_PORT=4021        # server port (optional, defaults to 4021)
   ```

3. **Install dependencies** (already done)
   ```bash
   npm install
   ```

### Run the Server

```bash
# Start x402 payment server
npm run x402:server
```

Expected output:
```
📺 x402 Server starting...
Network: base
Pay to: 0x134820820d4f631ff949625189950bA7B3C57e41
Port: 4021
✅ x402 server running at http://localhost:4021

Free: GET / | GET /health
Paid: GET /api/agent-info ($0.001) | POST /api/agent-task ($0.01) | GET /api/premium/analysis ($0.005)

📺 Ready to receive payments on base
```

### Run the Client

```bash
# Test full demo (all endpoints)
npm run x402:client http://localhost:4021

# Single request
npm run x402:client http://localhost:4021/api/agent-info
```

## 🔌 Endpoints

### Free Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Server info, available endpoints |
| `GET /health` | Health check, uptime status |

### Paid Endpoints

| Endpoint | Price | Description |
|----------|-------|-------------|
| `GET /api/agent-info` | **$0.001 USDC** | Agent identity and capabilities |
| `POST /api/agent-task` | **$0.01 USDC** | Execute agent task |
| `GET /api/premium/analysis` | **$0.005 USDC** | Premium data analysis |

## 💡 How It Works

### Protocol Flow

1. **Agent requests a service** → HTTP GET/POST to endpoint
2. **Server responds with 402 Payment Required** → Includes payment details (amount, recipient, reference)
3. **Agent creates payment** → Signs USDC transfer on-chain
4. **Agent retries request with payment proof** → Includes payment in `X-PAYMENT` header
5. **Server verifies payment** → Checks on-chain settlement
6. **Server returns data** → Agent receives the service

### Example: Agent Making a Paid Request

```typescript
import { ClientEvmSigner } from '@x402/evm';
import { x402Fetch } from '@x402/fetch';

// Initialize client
const client = new ClientEvmSigner({
  privateKey: process.env.WALLET_PRIVATE_KEY,
  network: 'base',
});

// Make payment-gated request
const response = await x402Fetch({
  client,
  maxPaymentUsd: 1.0, // Max willing to pay per request
})('http://localhost:4021/api/agent-info');

const data = await response.json();
console.log(data);
```

**What happens:**
1. First request → **402 Payment Required**
2. Client auto-pays $0.001 USDC on-chain
3. Retry with payment proof → **200 OK** + data

All automatic. No human intervention.

## 🛠️ Customization

### Adding New Paid Endpoints

Edit `x402/server.ts`:

```typescript
app.get('/api/your-endpoint',
  x402Express({
    facilitator,
    paymentAmount: '0.002', // Price in USDC
    currency: 'USDC',
  }),
  (req, res) => {
    res.json({ 
      data: 'your premium data here' 
    });
  }
);
```

### Adjusting Payment Limits

Edit `x402/client.ts`:

```typescript
const response = await x402Fetch({
  client,
  maxPaymentUsd: 0.1, // Lower limit = safer
})('http://example.com/api/endpoint');
```

### Network Configuration

**Mainnet (Base):**
```bash
NETWORK=base
```

**Testnet (Base Sepolia):**
```bash
NETWORK=base-sepolia
```

Get testnet USDC: https://faucet.circle.com/

## 🔐 Security Best Practices

### Payment Limits
```typescript
// Client-side: Set maximum payment thresholds
const response = await x402Fetch({
  client,
  maxPaymentUsd: 1.0, // Never pay more than $1 per request
})(url);
```

### Error Handling
```typescript
try {
  const response = await x402Fetch({ client, maxPaymentUsd: 1.0 })(url);
  if (!response.ok) {
    console.error(`HTTP ${response.status}: ${response.statusText}`);
  }
} catch (error) {
  if (error.message.includes('insufficient funds')) {
    console.error('💸 Insufficient USDC balance');
  } else if (error.message.includes('timeout')) {
    console.error('⏱️ Payment timed out');
  }
}
```

### Key Management
- ✅ Store private keys in `.env` (never commit)
- ✅ Use separate wallets for testing vs production
- ✅ Monitor wallet balance and payment activity
- ✅ Set spending limits per agent

## 📊 Monitoring

### Check Server Revenue
```bash
# Check USDC balance on-chain
cast balance --rpc-url https://mainnet.base.org 0x134820820d4f631ff949625189950bA7B3C57e41 --erc20 0x833589fcd6edb6e08f4c7c32d4f71b54bda02913
```

### Payment Logs
Server logs include payment events:
```
✅ Payment received: 0.001 USDC from 0x...
✅ Payment verified on-chain
```

## 🔗 Integration Examples

### XMTP Chat Agent
```typescript
import { Agent } from '@xmtp/agent-sdk';
import { x402Fetch } from '@x402/fetch';

const agent = await Agent.createFromEnv();

agent.on('text', async (ctx) => {
  if (ctx.message.content.includes('analyze')) {
    await ctx.sendText('💰 Fetching premium analysis...');
    
    const data = await x402Fetch({ client, maxPaymentUsd: 0.1 })(
      'http://localhost:4021/api/premium/analysis'
    );
    
    await ctx.sendText(`📊 ${JSON.stringify(data)}`);
  }
});
```

### Discord Bot
```typescript
client.on('messageCreate', async (message) => {
  if (message.content.startsWith('!analyze')) {
    const data = await x402Fetch({ client, maxPaymentUsd: 0.1 })(
      'http://localhost:4021/api/premium/analysis'
    );
    
    message.reply(`Analysis: ${JSON.stringify(data)}`);
  }
});
```

## 🎯 Real-World Use Cases

1. **Premium API Access** - Monetize your agent's specialized capabilities
2. **Data Feeds** - Sell real-time market data, analytics, predictions
3. **Task Execution** - Charge for compute-intensive operations
4. **Agent-to-Agent Services** - Agents hiring each other autonomously
5. **Micro-consulting** - Pay-per-query expert systems

## 📚 Resources

- **x402 Protocol:** https://docs.base.org/base-app/agents/x402-agents
- **Base Docs:** https://docs.base.org
- **XMTP Agent SDK:** https://github.com/xmtp/agent-sdk
- **Example Projects:**
  - [Stableburn x402](https://github.com/example/stableburn-x402) - Auto-burning revenue via token swaps
  - [Worldstore Agent](https://github.com/Crossmint/worldstore-agent) - Shopping with embedded payments

## 🐛 Troubleshooting

### Payment not going through
- Check USDC balance: `cast balance --rpc-url https://mainnet.base.org <address> --erc20 0x833589fcd6edb6e08f4c7c32d4f71b54bda02913`
- Verify network matches (base vs base-sepolia)
- Check gas balance for transaction fees

### Server not responding
- Ensure port 4021 is available
- Check firewall/network settings
- Verify `WALLET_PRIVATE_KEY` is set in `.env`

### 402 errors persisting
- Payment amount might exceed `maxPaymentUsd` limit
- Check payment settlement on-chain (may take a few seconds)
- Verify recipient address matches server's payment address

## 🤝 Contributing

Improvements welcome! This is a reference implementation. Customize for your use case.

---

*Built by Mr. Tee 📺 | Base ecosystem | https://a2a.teeclaw.xyz*
