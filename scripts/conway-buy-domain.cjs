#!/usr/bin/env node
/**
 * Buy a domain via Conway Domains API
 * SIWE auth + x402 payment
 */
'use strict';

const VIEM_DIR = '/home/phan_harry/.openclaw/workspace/node_modules/viem';
const SIWE_DIR = '/home/phan_harry/.openclaw/workspace/node_modules/siwe';
const fs = require('fs');
const crypto = require('crypto');

const { createPublicClient, createWalletClient, http, hexToBytes } = require(`${VIEM_DIR}/_cjs/index.js`);
const { privateKeyToAccount } = require(`${VIEM_DIR}/_cjs/accounts/index.js`);
const { base } = require(`${VIEM_DIR}/_cjs/chains/index.js`);
const { SiweMessage } = require(`${SIWE_DIR}/dist/siwe.js`);

const DOMAIN_API_URL = 'https://api.conway.domains';
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const DOMAIN_TO_BUY = process.argv[2] || 'payattention.wtf';

async function main() {
  // Load wallet
  const walletJson = JSON.parse(fs.readFileSync(`${process.env.HOME}/.conway/wallet.json`, 'utf8'));
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
  const verifyData = await verifyResp.json();
  console.log('Verify response:', JSON.stringify(verifyData));
  const access_token = verifyData.access_token;
  if (!access_token) throw new Error('No access token returned');
  console.log('Auth: OK ✓');

  const authHeader = { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' };

  // Check domain
  console.log(`\n[Check] ${DOMAIN_TO_BUY}...`);
  const checkResp = await fetch(`${DOMAIN_API_URL}/domains/check?domains=${DOMAIN_TO_BUY}`, { headers: authHeader });
  const checkData = await checkResp.json();
  const domainInfo = checkData.domains?.[0];
  console.log(`Available: ${domainInfo?.available}, Price: $${domainInfo?.price} ${domainInfo?.currency}`);
  if (!domainInfo?.available) throw new Error('Domain not available!');

  // Probe for x402 payment requirements
  console.log('\n[x402] Probing payment requirements...');
  const probe = await fetch(`${DOMAIN_API_URL}/domains/register`, {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({ domain: DOMAIN_TO_BUY, years: 1, privacy: true }),
  });
  console.log(`Probe status: ${probe.status}`);

  if (probe.status === 200 || probe.status === 201) {
    const data = await probe.json();
    console.log('Registered directly:', JSON.stringify(data, null, 2));
    return;
  }

  if (probe.status !== 402) {
    const data = await probe.text();
    console.log(`Unexpected status ${probe.status}:`, data);
    return;
  }

  // Parse x402 payment requirement
  const body402 = await probe.json();
  console.log('402 body:', JSON.stringify(body402, null, 2));

  const payReq = body402.accepts?.[0];
  if (!payReq) {
    console.log('No payment requirement found in 402 body');
    return;
  }

  const amount = BigInt(payReq.maxAmountRequired);
  const payTo = payReq.payToAddress || payReq.payTo;
  const usdcAddr = payReq.usdcAddress || payReq.asset || USDC_ADDRESS;
  const deadlineSecs = Math.floor(Date.now() / 1000) + (payReq.requiredDeadlineSeconds || payReq.maxTimeoutSeconds || 300);

  console.log(`\n[Pay] Authorizing ${Number(amount) / 1e6} USDC to ${payTo}...`);
  console.log(`Deadline: ${deadlineSecs} (${new Date(deadlineSecs * 1000).toISOString()})`);

  const walletClient = createWalletClient({ account, chain: base, transport: http() });

  // EIP-3009 TransferWithAuthorization
  const nonce32 = '0x' + crypto.randomBytes(32).toString('hex');
  const domain712 = {
    name: 'USD Coin',
    version: '2',
    chainId: 8453,
    verifyingContract: usdcAddr,
  };
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
  const typedMsg = {
    from: account.address,
    to: payTo,
    value: amount,
    validAfter: BigInt(0),
    validBefore: BigInt(deadlineSecs),
    nonce: nonce32,
  };

  const paymentSig = await walletClient.signTypedData({
    domain: domain712,
    types,
    primaryType: 'TransferWithAuthorization',
    message: typedMsg,
  });
  console.log('Payment signed ✓');

  const paymentPayload = {
    scheme: payReq.scheme || 'exact',
    network: payReq.network || 'eip155:8453',
    payload: {
      from: account.address,
      to: payTo,
      value: String(amount),
      validAfter: '0',
      validBefore: String(deadlineSecs),
      nonce: nonce32,
      signature: paymentSig,
    },
  };

  console.log('\n[Register] Sending registration with payment...');
  const finalResp = await fetch(`${DOMAIN_API_URL}/domains/register`, {
    method: 'POST',
    headers: {
      ...authHeader,
      'x-payment': JSON.stringify(paymentPayload),
      'X-Payment': JSON.stringify(paymentPayload),
    },
    body: JSON.stringify({ domain: DOMAIN_TO_BUY, years: 1, privacy: true }),
  });

  console.log(`Final status: ${finalResp.status}`);
  const finalData = await finalResp.json();
  console.log('\nResult:', JSON.stringify(finalData, null, 2));
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
