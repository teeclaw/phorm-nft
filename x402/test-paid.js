/**
 * Real x402 payment test — acting as customer paying /reputation/full-report
 * Uses our own wallet via GPG-decrypted private key
 */

// Load env manually (dotenv path issue workaround)
const fs = require('fs');
const envContent = fs.readFileSync(`${process.env.HOME}/.openclaw/.env`, 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
});
const { x402Fetch } = require('./x402-client');

const TARGET = 'http://localhost:3100/reputation/full-report';

async function main() {
  console.log('🧪 x402 payment test — customer perspective\n');

  // Step 1: Hit the endpoint cold (expect 402)
  console.log('Step 1: Initial request (expect 402)...');
  const { httpRequest } = require('./x402-client');

  // Manual first hit to show the 402 response
  const http = require('http');
  const initial = await new Promise((resolve) => {
    // Use a stable idempotency key so re-runs don't double-pay
  const testRunId = `test-${new Date().toISOString().slice(0,10)}`;
  const body = JSON.stringify({ from: 'Mr. Tee (self-test)', address: '0x134820820d4f631ff949625189950bA7B3C57e41', idempotencyKey: testRunId });
    const req = http.request({
      hostname: 'localhost', port: 3100, path: '/reputation/full-report',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
    });
    req.write(body); req.end();
  });

  const req0 = initial.body.accepts?.[0] || {};
  console.log(`   → Status: ${initial.status}`);
  console.log(`   → x402Version: ${initial.body.x402Version}`);
  console.log(`   → Payment required: ${(parseInt(req0.maxAmountRequired||0)/1e6).toFixed(2)} USDC`);
  console.log(`   → Sign to (intermediate): ${req0.payTo}`);
  console.log(`   → Final recipient: ${req0.extra?.recipient}`);
  console.log(`   → Asset: ${req0.asset}\n`);

  // Step 2: Pay via x402Fetch (auto-handles 402 → sign → retry)
  console.log('Step 2: Paying with EIP-3009 via onchain.fi...');
  const result = await x402Fetch(
    TARGET,
    {
      method: 'POST',
      body: { from: 'Mr. Tee (self-test)', address: '0x134820820d4f631ff949625189950bA7B3C57e41' },
    },
    {
      maxAmount: '2.50', // safety cap slightly above $2
      network: 'base',
    }
  );

  console.log(`\nStep 3: Final response (status ${result.status}):`);
  console.log(JSON.stringify(result.body, null, 2));

  if (result.x402) {
    console.log('\n✅ Payment confirmed:', result.x402);
  }
}

main().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
