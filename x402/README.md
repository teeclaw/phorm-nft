# x402 — Reusable Payment Module

Handles **incoming** (server) and **outgoing** (client) x402 payments via onchain.fi.

## Files

- `x402-server.js` — Express middleware for receiving payments
- `x402-client.js` — Fetch wrapper for paying x402-protected endpoints

## Requires

- `ONCHAIN_API_KEY` in `.env`
- `OPENCLAW_GPG_PASSPHRASE` in `.env` (for private key decryption)
- `viem` (installed)

---

## Server (Incoming)

```js
const { x402 } = require('../x402/x402-server');

// Single route
app.post('/paid', x402({
  amount: '2.00',
  token: 'USDC',
  network: 'base',
  recipient: '0x134820820d4f631ff949625189950bA7B3C57e41',
}), handler);

// Multi-route
app.use(x402({
  recipient: '0x134820820d4f631ff949625189950bA7B3C57e41',
  freeRoutes: ['/health', '/.well-known/agent-card.json'],
  routes: {
    'POST /reputation/full-report': { amount: '2.00' },
    'POST /premium':                { amount: '0.50', priority: 'speed' },
  }
}));
```

**What callers receive on 402:**
```json
{
  "error": "Payment Required",
  "x402": {
    "amount": "2.00",
    "token": "USDC",
    "sourceNetwork": "base",
    "destinationNetwork": "base",
    "signTo": "0xfeb1F8F7F9ff37B94D14c88DE9282DA56b3B1Cb1",
    "recipient": "0x1348...",
    "description": "x402 payment required"
  }
}
```

**Payment info attached to req on success:**
```js
req.x402 = { verified, txHash, facilitator, amount, token, network }
```

---

## Client (Outgoing)

```js
const { x402Fetch, createX402Client } = require('../x402/x402-client');

// One-shot (auto-pays 402 responses)
const res = await x402Fetch(
  'https://agent.example.com/paid-endpoint',
  { method: 'POST', body: { task: 'summarize', text: '...' } },
  { maxAmount: '5.00', network: 'base' }  // safety cap
);

// Persistent client
const client = createX402Client({ network: 'base', maxAmount: '10.00' });
const res = await client.fetch('https://...', { method: 'POST', body: {...} });
```

**Safety cap:** Set `maxAmount` to prevent accidental overpayment.

---

## How payments work

### Incoming (server)
```
Caller → POST /endpoint
  → No X-Payment header → 402 + requirements (signTo = onchain.fi intermediate)
  → Has X-Payment header → verify via onchain.fi /v1/pay → settle → proceed
```

### Outgoing (client)
```
We → POST /endpoint
  → 402 received → parse amount + requirements
  → Sign EIP-3009 (USDC permit) to onchain.fi intermediate address
  → Retry with X-Payment header
  → onchain.fi settles to endpoint owner
```

---

## Cross-chain support

| Flow | Sign to |
|------|---------|
| Base → Base | `0xfeb1F8F7...` |
| Solana → Solana | `DoVABZK8...` |
| Base → Solana | `0x931Cc2F1...` |
| Solana → Base | `AGm6Dzvd...` |
