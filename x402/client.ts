#!/usr/bin/env tsx
/**
 * x402 Payment Client - Autonomous agent that pays for services
 * 
 * This client demonstrates how an AI agent can autonomously pay for
 * x402-gated API services using USDC on Base network.
 * 
 * Based on: https://docs.base.org/base-app/agents/x402-agents
 */

import { ClientEvmSigner } from '@x402/evm';
import { x402Fetch } from '@x402/fetch';
import dotenv from 'dotenv';

dotenv.config({ path: '/home/phan_harry/.openclaw/.env' });

const NETWORK = process.env.NETWORK || 'base';
const WALLET_KEY = process.env.XMTP_WALLET_KEY || process.env.WALLET_PRIVATE_KEY;

if (!WALLET_KEY) {
  console.error('❌ Missing WALLET_PRIVATE_KEY or XMTP_WALLET_KEY in .env');
  process.exit(1);
}

// Initialize x402 client (makes payments)
const client = new ClientEvmSigner({
  privateKey: WALLET_KEY,
  network: NETWORK as 'base' | 'base-sepolia',
});

const walletAddress = client.getAddress();

console.log('📺 x402 Client');
console.log(`Wallet: ${walletAddress}`);
console.log(`Network: ${NETWORK}\n`);

/**
 * Make a payment-gated request
 */
async function makeX402Request(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  try {
    console.log(`\n🔍 Requesting: ${url}`);
    
    const response = await x402Fetch({
      client,
      maxPaymentUsd: 1.0, // Maximum willing to pay per request
    })(url, options);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Success!');
    return data;
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

/**
 * Demo: Call various x402 endpoints
 */
async function demo(targetUrl: string) {
  console.log('='.repeat(60));
  console.log('x402 CLIENT DEMO');
  console.log('='.repeat(60));

  // 1. Free endpoint (no payment)
  console.log('\n📡 Step 1: Free endpoint (GET /)');
  const info = await makeX402Request(targetUrl);
  console.log(JSON.stringify(info, null, 2));

  // 2. Paid endpoint - Agent info ($0.001)
  console.log('\n💰 Step 2: Paid endpoint (GET /api/agent-info)');
  console.log('Price: $0.001 USDC');
  const agentInfo = await makeX402Request(`${targetUrl}/api/agent-info`);
  console.log(JSON.stringify(agentInfo, null, 2));

  // 3. Paid endpoint - Task execution ($0.01)
  console.log('\n💰 Step 3: Paid endpoint (POST /api/agent-task)');
  console.log('Price: $0.01 USDC');
  const taskResult = await makeX402Request(`${targetUrl}/api/agent-task`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      task: 'analyze_onchain_activity',
      parameters: { 
        network: 'base',
        timeframe: '24h',
      },
    }),
  });
  console.log(JSON.stringify(taskResult, null, 2));

  // 4. Paid endpoint - Premium analysis ($0.005)
  console.log('\n💰 Step 4: Paid endpoint (GET /api/premium/analysis)');
  console.log('Price: $0.005 USDC');
  const analysis = await makeX402Request(`${targetUrl}/api/premium/analysis`);
  console.log(JSON.stringify(analysis, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('✅ All requests completed!');
  console.log('='.repeat(60));
}

// ========== CLI ==========

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage:');
  console.log('  npm run x402:client <endpoint_url>');
  console.log('');
  console.log('Examples:');
  console.log('  npm run x402:client http://localhost:4021');
  console.log('  npm run x402:client https://x402.example.com');
  console.log('');
  console.log('Single request:');
  console.log('  npm run x402:client http://localhost:4021/api/agent-info');
  process.exit(0);
}

const targetUrl = args[0];

// If URL includes a path, make single request
if (targetUrl.includes('/api/')) {
  makeX402Request(targetUrl)
    .then(data => {
      console.log('\nResponse:');
      console.log(JSON.stringify(data, null, 2));
    })
    .catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
} else {
  // Otherwise run full demo
  demo(targetUrl)
    .catch(err => {
      console.error('Demo failed:', err.message);
      process.exit(1);
    });
}
