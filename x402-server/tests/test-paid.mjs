import 'dotenv/config';
import { x402Client, x402HTTPClient } from '@x402/core/client';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import { privateKeyToAccount } from 'viem/accounts';

// --- Config ---
const SERVER = process.env.X402_SERVER || 'http://localhost:4021';
const ADDRESS = process.argv[2] || '0x168d8b4f50bb3aa67d05a6937b643004257118ed';
const PRIVATE_KEY = process.env.MAIN_WALLET_PRIVATE_KEY || process.env.WALLET_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error('ERROR: WALLET_PRIVATE_KEY not set in .env');
  process.exit(1);
}

// --- Setup x402 client ---
const account = privateKeyToAccount(PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`);
console.log(`Paying from: ${account.address}`);
console.log(`Querying:    ${ADDRESS}`);
console.log(`Server:      ${SERVER}`);
console.log('---');

const coreClient = new x402Client();
registerExactEvmScheme(coreClient, { signer: account });
const httpClient = new x402HTTPClient(coreClient);

// --- Step 1: Hit paid endpoint, expect 402 ---
const url = `${SERVER}/reputation/full-report?address=${ADDRESS}`;
console.log('Step 1: Requesting paid endpoint...');

const initialRes = await fetch(url);
console.log(`Status: ${initialRes.status}`);

if (initialRes.status !== 402) {
  console.log('Expected 402, got:', initialRes.status);
  console.log(await initialRes.text());
  process.exit(1);
}

// --- Step 2: Extract payment requirements from 402 response ---
console.log('Step 2: Extracting payment requirements...');

const paymentRequired = httpClient.getPaymentRequiredResponse(
  (name) => initialRes.headers.get(name),
  await initialRes.json().catch(() => null)
);
console.log('Payment required:', JSON.stringify(paymentRequired, null, 2));

// --- Step 3: Create payment payload (signs EIP-3009 locally) ---
console.log('\nStep 3: Signing payment locally...');
const paymentPayload = await httpClient.createPaymentPayload(paymentRequired);
console.log('Payment signed ✅');

// --- Step 4: Resend request with payment header ---
console.log('\nStep 4: Sending paid request...');
const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);
console.log('Payment header keys:', Object.keys(paymentHeaders));

const paidRes = await fetch(url, {
  headers: paymentHeaders,
});

console.log(`Status: ${paidRes.status}`);

if (paidRes.ok) {
  const data = await paidRes.json();
  console.log('\n✅ FULL REPUTATION PROFILE:');
  console.log(JSON.stringify(data, null, 2));
} else {
  console.log('❌ Payment failed:');
  console.log(await paidRes.text());
}
