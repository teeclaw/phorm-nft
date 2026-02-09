#!/usr/bin/env tsx
/**
 * x402 Payment Server - Simplified Demo
 * 
 * This is a simplified demonstration server showing the x402 protocol flow.
 * For production use, you need to integrate with an x402 facilitator service.
 * 
 * Based on: https://docs.base.org/base-app/agents/x402-agents
 */

import express from 'express';
import { paymentMiddleware, x402ResourceServer } from '@x402/express';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { HTTPFacilitatorClient } from '@x402/core/server';
import dotenv from 'dotenv';

dotenv.config({ path: '/home/phan_harry/.openclaw/.env' });

const app = express();
const PORT = parseInt(process.env.X402_PORT || '4021');
const NETWORK = process.env.NETWORK || 'base';
const WALLET_ADDRESS = '0x134820820d4f631ff949625189950bA7B3C57e41'; // Payment recipient

// Network mapping
const networkCaip2 = NETWORK === 'base' ? 'eip155:8453' : 'eip155:84532';

console.log('📺 x402 Server starting (SIMPLIFIED DEMO)...');
console.log(`Network: ${NETWORK} (${networkCaip2})`);
console.log(`Pay to: ${WALLET_ADDRESS}`);
console.log(`Port: ${PORT}`);
console.log('\n⚠️  NOTE: This demo shows the protocol flow.');
console.log('For production, integrate with an x402 facilitator service.');

// Configure facilitator client (using public facilitator or your own)
// For demo purposes, this will show 402 responses without actual settlement
const facilitatorClient = new HTTPFacilitatorClient({ 
  url: process.env.X402_FACILITATOR_URL || 'https://facilitator.x402.org' 
});

// Create resource server and register EVM scheme
const resourceServer = new x402ResourceServer(facilitatorClient)
  .register(networkCaip2, new ExactEvmScheme());

// Configure payment routes
const paymentRoutes = {
  'GET /api/agent-info': {
    accepts: {
      scheme: 'exact',
      price: '$0.001',
      network: networkCaip2,
      payTo: WALLET_ADDRESS,
    },
    description: 'Agent identity and capabilities',
  },
  'POST /api/agent-task': {
    accepts: {
      scheme: 'exact',
      price: '$0.01',
      network: networkCaip2,
      payTo: WALLET_ADDRESS,
    },
    description: 'Execute agent task',
  },
  'GET /api/premium/analysis': {
    accepts: {
      scheme: 'exact',
      price: '$0.005',
      network: networkCaip2,
      payTo: WALLET_ADDRESS,
    },
    description: 'Premium data analysis',
  },
};

// Apply payment middleware
app.use(
  paymentMiddleware(
    paymentRoutes,
    resourceServer,
    undefined, // paywallConfig (optional UI)
    undefined, // paywall provider (optional custom)
    false      // Don't sync facilitator on start for demo
  )
);

// Middleware for JSON body parsing
app.use(express.json());

// ========== FREE ENDPOINTS ==========

app.get('/', (req, res) => {
  res.json({
    name: 'Mr. Tee x402 Agent (Demo)',
    emoji: '📺',
    network: NETWORK,
    networkCaip2,
    paymentAddress: WALLET_ADDRESS,
    note: 'This is a demo server showing x402 protocol flow',
    endpoints: {
      free: [
        'GET / - This endpoint',
        'GET /health - Health check',
      ],
      paid: [
        'GET /api/agent-info ($0.001 USDC) - Agent identity',
        'POST /api/agent-task ($0.01 USDC) - Execute task',
        'GET /api/premium/analysis ($0.005 USDC) - Premium data',
      ],
    },
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mode: 'demo',
    timestamp: new Date().toISOString(),
    network: NETWORK,
    networkCaip2,
  });
});

// ========== PAID ENDPOINTS ==========
// These are protected by paymentMiddleware above

app.get('/api/agent-info', (req, res) => {
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
      network: NETWORK,
      networkCaip2,
      wallet: WALLET_ADDRESS,
      a2a: 'https://a2a.teeclaw.xyz/a2a',
    },
  });
});

app.post('/api/agent-task', (req, res) => {
  const { task, parameters } = req.body;

  if (!task) {
    return res.status(400).json({ error: 'Missing task parameter' });
  }

  res.json({
    taskId: `task_${Date.now()}`,
    task,
    parameters,
    status: 'completed',
    result: `Task "${task}" executed successfully`,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/premium/analysis', (req, res) => {
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
});

// ========== ERROR HANDLING ==========

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ========== START SERVER ==========

app.listen(PORT, () => {
  console.log(`\n✅ x402 demo server running at http://localhost:${PORT}`);
  console.log(`\nFree: GET / | GET /health`);
  console.log(`Paid: GET /api/agent-info ($0.001) | POST /api/agent-task ($0.01) | GET /api/premium/analysis ($0.005)`);
  console.log(`\n📺 Server ready - will return 402 Payment Required for paid endpoints`);
  console.log(`\n💡 For production: Configure X402_FACILITATOR_URL in .env`);
});
