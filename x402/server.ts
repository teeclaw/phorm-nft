#!/usr/bin/env tsx
/**
 * x402 Payment Server - Mr. Tee's Autonomous Payment Endpoint
 * 
 * This server demonstrates x402 protocol implementation on Base network.
 * It provides both free and paid endpoints that agents can access autonomously.
 * 
 * Based on: https://docs.base.org/base-app/agents/x402-agents
 */

import express from 'express';
import { x402Express } from '@x402/express';
import { FacilitatorEvmSigner } from '@x402/evm';
import dotenv from 'dotenv';

dotenv.config({ path: '/home/phan_harry/.openclaw/.env' });

const app = express();
const PORT = process.env.X402_PORT || 4021;
const NETWORK = process.env.NETWORK || 'base';
const WALLET_KEY = process.env.XMTP_WALLET_KEY || process.env.WALLET_PRIVATE_KEY;

if (!WALLET_KEY) {
  console.error('❌ Missing WALLET_PRIVATE_KEY or XMTP_WALLET_KEY in .env');
  process.exit(1);
}

// Initialize x402 facilitator (receives payments)
const facilitator = new FacilitatorEvmSigner({
  privateKey: WALLET_KEY,
  network: NETWORK as 'base' | 'base-sepolia',
});

// Get payment address
const paymentAddress = facilitator.getAddress();

console.log('📺 x402 Server starting...');
console.log(`Network: ${NETWORK}`);
console.log(`Pay to: ${paymentAddress}`);
console.log(`Port: ${PORT}`);

// ========== FREE ENDPOINTS ==========

app.get('/', (req, res) => {
  res.json({
    name: 'Mr. Tee x402 Agent',
    emoji: '📺',
    network: NETWORK,
    paymentAddress,
    endpoints: {
      free: [
        'GET / - This endpoint',
        'GET /health - Health check',
      ],
      paid: [
        'GET /api/agent-info ($0.001 USDC) - Agent identity and capabilities',
        'POST /api/agent-task ($0.01 USDC) - Execute agent task',
        'GET /api/premium/analysis ($0.005 USDC) - Premium data analysis',
      ],
    },
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    network: NETWORK,
  });
});

// ========== PAID ENDPOINTS ==========

// GET /api/agent-info - $0.001 USDC
app.get('/api/agent-info',
  x402Express({
    facilitator,
    paymentAmount: '0.001',
    currency: 'USDC',
  }),
  (req, res) => {
    res.json({
      agentId: '8f7712b7-c4a8-4dc7-b614-0b958d561891',
      name: 'Mr. Tee',
      emoji: '📺',
      description: 'CRT monitor-headed AI agent building on Base',
      capabilities: [
        'Base ecosystem operations',
        'zkBasecred development',
        'Social coordination (X, Farcaster)',
        'Autonomous workflows',
      ],
      social: {
        twitter: '@mr_crtee',
        farcaster: '@mr-teeclaw',
        github: 'teeclaw',
      },
      onchain: {
        network: 'base',
        wallet: paymentAddress,
        a2a: 'https://a2a.teeclaw.xyz/a2a',
      },
    });
  }
);

// POST /api/agent-task - $0.01 USDC
app.post('/api/agent-task',
  express.json(),
  x402Express({
    facilitator,
    paymentAmount: '0.01',
    currency: 'USDC',
  }),
  (req, res) => {
    const { task, parameters } = req.body;

    if (!task) {
      return res.status(400).json({ error: 'Missing task parameter' });
    }

    // Simulate task execution
    const result = {
      taskId: `task_${Date.now()}`,
      task,
      parameters,
      status: 'completed',
      result: `Task "${task}" executed successfully`,
      timestamp: new Date().toISOString(),
    };

    res.json(result);
  }
);

// GET /api/premium/analysis - $0.005 USDC
app.get('/api/premium/analysis',
  x402Express({
    facilitator,
    paymentAmount: '0.005',
    currency: 'USDC',
  }),
  (req, res) => {
    // Return mock analysis data
    res.json({
      analysis: {
        market: 'bullish',
        confidence: 0.87,
        signals: ['volume_increase', 'positive_sentiment', 'momentum_shift'],
        recommendation: 'Consider accumulation on dips',
        timestamp: new Date().toISOString(),
      },
      metadata: {
        dataSource: 'aggregated_feeds',
        modelVersion: 'v2.1',
        computeCost: '0.005 USDC',
      },
    });
  }
);

// ========== ERROR HANDLING ==========

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ========== START SERVER ==========

app.listen(PORT, () => {
  console.log(`✅ x402 server running at http://localhost:${PORT}`);
  console.log(`\nFree: GET / | GET /health`);
  console.log(`Paid: GET /api/agent-info ($0.001) | POST /api/agent-task ($0.01) | GET /api/premium/analysis ($0.005)`);
  console.log(`\n📺 Ready to receive payments on ${NETWORK}`);
});
