#!/usr/bin/env node
/**
 * Buy a domain via Conway Domains API
 * SIWE auth + x402 payment
 */
import { createPublicClient, createWalletClient, http, parseUnits } from '/home/phan_harry/node_modules/viem/index.js';
import { privateKeyToAccount } from '/home/phan_harry/node_modules/viem/accounts.js';
import { base } from '/home/phan_harry/node_modules/viem/chains.js';
import { SiweMessage } from '/home/phan_harry/node_modules/siwe/dist/index.js';
import { readFileSync } from 'fs';

const DOMAIN_API_URL = 'https://api.conway.domains';
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const DOMAIN = process.argv[2] || 'payattention.wtf';

// Load wallet
const walletJson = JSON.parse(readFileSync(`${process.env.HOME}/.conway/wallet.json`, 'utf8'));
const account = privateKeyToAccount(walletJson.privateKey);
console.log(`Conway Wallet: ${account.address}`);

// Check USDC balance
const publicClient = createPublicClient({ chain: base, transport: http() });
const balRaw = await publicClient.readContract({
  address: USDC_ADDRESS,
  abi: [{ name: 'balanceOf', type: 'function', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' }],
  functionName: 'balanceOf',
  args: [account.address],
});
const balance = Number(balRaw) / 1e6;
console.log(`USDC Balance: $${balance.toFixed(2)}`);

// SIWE auth
console.log('\n[Auth] Getting nonce...');
const nonceResp = await fetch(`${DOMAIN_API_URL}/auth/nonce`, { method: 'POST' });
if (!nonceResp.ok) throw new Error(`Nonce failed: ${nonceResp.status} ${await nonceResp.text()}`);
const nonceData = await nonceResp.json();
const nonce = nonceData.nonce;
console.log(`Nonce: ${nonce}`);

const siwe = new SiweMessage({
  domain: 'api.conway.domains',
  address: account.address,
  statement: 'Sign in to Conway Domains',
  uri: 'https://api.conway.domains',
  version: '1',
  chainId: 8453,
  nonce,
  issuedAt: new Date().toISOString(),
});
const msg = siwe.prepareMessage();
const sig = await account.signMessage({ message: msg });

const verifyResp = await fetch(`${DOMAIN_API_URL}/auth/verify`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: msg, signature: sig }),
});
if (!verifyResp.ok) throw new Error(`Verify failed: ${verifyResp.status} ${await verifyResp.text()}`);
const { access_token } = await verifyResp.json();
if (!access_token) throw new Error('No access token returned');
console.log('Auth: OK ✓');

const authHeader = { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' };

// Check domain
console.log(`\n[Check] ${DOMAIN}...`);
const checkResp = await fetch(`${DOMAIN_API_URL}/domains/check?domains=${DOMAIN}`, { headers: authHeader });
const checkData = await checkResp.json();
const domainInfo = checkData.domains?.[0];
console.log(`Available: ${domainInfo?.available}, Price: $${domainInfo?.price} ${domainInfo?.currency}`);
if (!domainInfo?.available) throw new Error('Domain not available!');

// Probe x402 requirements
console.log('\n[x402] Probing payment requirements...');
const probe = await fetch(`${DOMAIN_API_URL}/domains/register`, {
  method: 'POST',
  headers: authHeader,
  body: JSON.stringify({ domain: DOMAIN, years: 1, privacy: true }),
});
console.log(`Probe status: ${probe.status}`);
if (probe.status !== 402) {
  // No payment required or direct registration
  const data = await probe.json();
  console.log('Result:', JSON.stringify(data, null, 2));
  process.exit(0);
}

const paymentHeader = probe.headers.get('x-payment-required') || probe.headers.get('x402-payment-required');
const wwwAuth = probe.headers.get('www-authenticate');
console.log('x-payment-required:', paymentHeader);
console.log('www-authenticate:', wwwAuth);

// Parse payment requirements
let payReq;
try {
  const body402 = await probe.json();
  console.log('402 body:', JSON.stringify(body402, null, 2));
  payReq = body402.accepts?.[0] || body402;
} catch (e) {
  console.log('Could not parse 402 body');
}

// Build x402 payment
if (payReq) {
  const amount = BigInt(payReq.maxAmountRequired);
  const payTo = payReq.payToAddress;
  const usdcAddr = payReq.usdcAddress || USDC_ADDRESS;
  const deadline = Math.floor(Date.now() / 1000) + (payReq.requiredDeadlineSeconds || 300);

  console.log(`\n[Pay] Sending ${Number(amount) / 1e6} USDC to ${payTo}...`);

  const walletClient = createWalletClient({ account, chain: base, transport: http() });

  // EIP-3009 transferWithAuthorization
  const domain712 = { name: 'USD Coin', version: '2', chainId: 8453, verifyingContract: usdcAddr };
  const types = {
    TransferWithAuthorization: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
    ],
  };
  const nonce32 = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('');
  const message712 = {
    from: account.address,
    to: payTo,
    value: amount,
    validAfter: BigInt(0),
    validBefore: BigInt(deadline),
    nonce: nonce32,
  };
  const paymentSig = await walletClient.signTypedData({ domain: domain712, types, primaryType: 'TransferWithAuthorization', message: message712 });

  const payload = {
    scheme: payReq.scheme || 'exact',
    network: payReq.network || 'eip155:8453',
    payload: {
      from: account.address,
      to: payTo,
      value: String(amount),
      validAfter: '0',
      validBefore: String(deadline),
      nonce: nonce32,
      signature: paymentSig,
      usdcAddress: usdcAddr,
    },
  };

  const finalResp = await fetch(`${DOMAIN_API_URL}/domains/register`, {
    method: 'POST',
    headers: {
      ...authHeader,
      'x-payment': JSON.stringify(payload),
      'X-Payment': JSON.stringify(payload),
    },
    body: JSON.stringify({ domain: DOMAIN, years: 1, privacy: true }),
  });

  console.log(`Final status: ${finalResp.status}`);
  const finalData = await finalResp.json();
  console.log('\nRegistration result:', JSON.stringify(finalData, null, 2));
}
