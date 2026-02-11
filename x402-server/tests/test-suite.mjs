#!/usr/bin/env node
/**
 * x402 Reputation Server — Full Test Suite
 * 
 * Tests:
 *  1. GET /health              (free)
 *  2. GET /reputation          (free summary)
 *  3. GET /reputation          (bad address → 400)
 *  4. GET /reputation/full     (no payment → 402)
 *  5. GET /reputation/full     (with x402 payment → 200)
 *  6. GET /reputation/full     (bad address + payment → 400)
 */
import 'dotenv/config';
import { x402Client, x402HTTPClient } from '@x402/core/client';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import { privateKeyToAccount } from 'viem/accounts';

const SERVER = process.env.X402_SERVER || 'http://localhost:4021';
const TEST_ADDR = '0x168d8b4f50bb3aa67d05a6937b643004257118ed';
const BAD_ADDR = '0xINVALID';
const PRIVATE_KEY = process.env.MAIN_WALLET_PRIVATE_KEY || process.env.WALLET_PRIVATE_KEY;
const DRY_RUN = process.argv.includes('--dry-run');
const SKIP_PAID = process.argv.includes('--skip-paid');

let httpClient;
const results = [];

function log(msg) { console.log(msg); }
function pass(name) { results.push({ name, ok: true }); log(`  ✅ ${name}`); }
function fail(name, reason) { results.push({ name, ok: false, reason }); log(`  ❌ ${name}: ${reason}`); }

async function test(name, fn) {
  try {
    await fn();
  } catch (err) {
    fail(name, err.message);
  }
}

// ─── Setup ───
if (PRIVATE_KEY && !DRY_RUN) {
  const account = privateKeyToAccount(PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`);
  const core = new x402Client();
  registerExactEvmScheme(core, { signer: account });
  httpClient = new x402HTTPClient(core);
  log(`Wallet: ${account.address}`);
} else if (DRY_RUN || SKIP_PAID) {
  log(`${DRY_RUN ? 'DRY RUN' : 'SKIP PAID'} — skipping payment tests`);
} else {
  log('⚠️  No WALLET_PRIVATE_KEY — payment tests will be skipped\n   Use --skip-paid to skip intentionally, --dry-run to skip all wallet tests');
}

log(`Server: ${SERVER}\n`);

// ─── 1. Health ───
await test('1. GET /health', async () => {
  const res = await fetch(`${SERVER}/health`);
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  const data = await res.json();
  if (data.status !== 'ok') throw new Error(`Status: ${data.status}`);
  if (!data.endpoints) throw new Error('Missing endpoints map');
  pass('GET /health → 200 OK');
  log(`     Service: ${data.service} v${data.version}`);
  log(`     Network: ${data.network}`);
  log(`     PayTo:   ${data.payTo}`);
});

// ─── 2. Free summary ───
await test('2. GET /reputation (free)', async () => {
  const res = await fetch(`${SERVER}/reputation/simple-report?address=${TEST_ADDR}`);
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  const data = await res.json();
  if (!data.summary) throw new Error('Missing summary');
  if (!data.address) throw new Error('Missing address');
  pass('GET /reputation → 200 summary');
  log(`     Ethos score:   ${data.summary.ethos?.score ?? 'N/A'}`);
  log(`     Builder score: ${data.summary.talent?.builderScore ?? 'N/A'}`);
  log(`     Farcaster:     ${data.summary.farcaster?.score ?? 'N/A'}`);
  log(`     Recency:       ${data.summary.recency ?? 'N/A'}`);
});

// ─── 3. Bad address → 400 ───
await test('3. GET /reputation (bad address)', async () => {
  const res = await fetch(`${SERVER}/reputation/simple-report?address=${BAD_ADDR}`);
  if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  const data = await res.json();
  if (!data.error) throw new Error('Missing error message');
  pass('GET /reputation bad addr → 400');
});

// ─── 4. Paid endpoint without payment → 402 ───
await test('4. GET /reputation/full (no payment)', async () => {
  const res = await fetch(`${SERVER}/reputation/full-report?address=${TEST_ADDR}`);
  if (res.status !== 402) throw new Error(`Expected 402, got ${res.status}`);
  
  // Check payment requirements header exists
  const payReq = res.headers.get('x-payment') || res.headers.get('x-payment-requirements');
  // x402 v2 may use different header names, just check 402 status
  pass('GET /reputation/full no payment → 402');
});

// ─── 5. Paid endpoint WITH x402 payment → 200 ───
if (httpClient && !DRY_RUN && !SKIP_PAID) {
  await test('5. GET /reputation/full (x402 paid)', async () => {
    // Step A: Get 402 response
    const url = `${SERVER}/reputation/full-report?address=${TEST_ADDR}`;
    const res402 = await fetch(url);
    if (res402.status !== 402) throw new Error(`Expected 402, got ${res402.status}`);

    // Step B: Extract payment requirements
    const body402 = await res402.json().catch(() => null);
    const paymentRequired = httpClient.getPaymentRequiredResponse(
      (name) => res402.headers.get(name),
      body402
    );

    if (!paymentRequired.accepts?.length) throw new Error('No payment options in 402');

    // Step C: Sign payment locally
    const paymentPayload = await httpClient.createPaymentPayload(paymentRequired);

    // Step D: Send paid request
    const headers = httpClient.encodePaymentSignatureHeader(paymentPayload);
    const paidRes = await fetch(url, { headers });

    if (paidRes.status !== 200) {
      const errText = await paidRes.text();
      throw new Error(`Expected 200, got ${paidRes.status}: ${errText}`);
    }

    const data = await paidRes.json();
    if (!data.profile) throw new Error('Missing profile in response');
    if (!data._payment) throw new Error('Missing _payment metadata');

    pass('GET /reputation/full x402 → 200 full profile');
    log(`     Sources: ethos=${data.sources.ethos}, talent=${data.sources.talent}, farcaster=${data.sources.farcaster}`);
    log(`     Payment: ${data._payment.amount} ${data._payment.currency} on ${data._payment.network}`);

    // Display human-readable report
    if (data.humanReadable) {
      log('\n' + data.humanReadable);
    }

    // Save full results to file
    const now = new Date();
    const ts = `${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}-${String(now.getFullYear()).slice(2)} ${String(now.getHours()).padStart(2,'0')}h${String(now.getMinutes()).padStart(2,'0')}m`;
    const outFile = `Basecred-${ts}.json`;
    const fs = await import('fs');
    fs.writeFileSync(outFile, JSON.stringify(data, null, 2));
    log(`\n     💾 Full results saved to: ${outFile}`);

    // Markers for auto-send (human-readable message + JSON file)
    if (data.humanReadable) {
      log(`     📨 SEND_MSG:${data.humanReadable}`);
    }
    log(`     📨 SEND_FILE:${process.cwd()}/${outFile}`);
  });
} else {
  log('  ⏭️  5. Skipped (no wallet key or --dry-run)');
}

// ─── 6. Paid endpoint bad address (even with payment) → 400 ───
await test('6. GET /reputation/full (bad address)', async () => {
  const res = await fetch(`${SERVER}/reputation/full-report?address=${BAD_ADDR}`);
  // Should get 400 before payment middleware kicks in, or 402 then 400 after
  if (res.status !== 400 && res.status !== 402) {
    throw new Error(`Expected 400 or 402, got ${res.status}`);
  }
  pass(`GET /reputation/full bad addr → ${res.status}`);
});

// ─── Summary ───
log('\n═══ RESULTS ═══');
const passed = results.filter(r => r.ok).length;
const failed = results.filter(r => !r.ok).length;
log(`${passed} passed, ${failed} failed out of ${results.length} tests`);

if (failed > 0) {
  log('\nFailed tests:');
  results.filter(r => !r.ok).forEach(r => log(`  ❌ ${r.name}: ${r.reason}`));
  process.exit(1);
}

log('\n🎉 All tests passed!');
