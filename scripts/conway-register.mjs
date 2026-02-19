#!/usr/bin/env node
// Conway Domains registration via SIWE auth
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { readFileSync } from 'fs';

const CONWAY_API = 'https://api.conway.domains';
const walletJson = JSON.parse(readFileSync(`${process.env.HOME}/.conway/wallet.json`, 'utf8'));
const PRIVATE_KEY = walletJson.privateKey;
const DOMAIN_TO_REGISTER = process.argv[2] || 'payattention.wtf';

const account = privateKeyToAccount(PRIVATE_KEY);
console.log('Wallet:', account.address);

// Step 1: Get nonce
console.log('\n1. Getting nonce...');
const nonceRes = await fetch(`${CONWAY_API}/auth/nonce`);
const { nonce } = await nonceRes.json();
console.log('Nonce:', nonce);

// Step 2: Create SIWE message
const now = new Date().toISOString();
const siweMessage = [
  `conway.domains wants you to sign in with your Ethereum account:`,
  account.address,
  ``,
  `Sign in to Conway Domains`,
  ``,
  `URI: https://conway.domains`,
  `Version: 1`,
  `Chain ID: 8453`,
  `Nonce: ${nonce}`,
  `Issued At: ${now}`,
].join('\n');

console.log('\n2. Signing SIWE message...');
const signature = await account.signMessage({ message: siweMessage });
console.log('Signed ✓');

// Step 3: Verify/login
console.log('\n3. Authenticating...');
const authRes = await fetch(`${CONWAY_API}/auth/verify`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: siweMessage, signature }),
});
const authData = await authRes.json();
console.log('Auth response:', JSON.stringify(authData, null, 2));

if (!authData.token && !authData.sessionToken) {
  console.error('Auth failed - no token received');
  process.exit(1);
}

const token = authData.token || authData.sessionToken;
const authHeader = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

// Step 4: Check balance
console.log('\n4. Checking wallet balance...');
const balRes = await fetch(`${CONWAY_API}/wallet/balance`, { headers: authHeader });
const balData = await balRes.json();
console.log('Balance:', JSON.stringify(balData, null, 2));

// Step 5: Check domain availability
console.log(`\n5. Checking ${DOMAIN_TO_REGISTER}...`);
const checkRes = await fetch(`${CONWAY_API}/domains/check?domains=${DOMAIN_TO_REGISTER}`, { headers: authHeader });
const checkData = await checkRes.json();
console.log('Availability:', JSON.stringify(checkData, null, 2));

// Step 6: Register
if (checkData.domains?.[0]?.available) {
  const price = checkData.domains[0].price;
  console.log(`\n6. Registering ${DOMAIN_TO_REGISTER} for $${price}...`);
  const regRes = await fetch(`${CONWAY_API}/domains/register`, {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({ domain: DOMAIN_TO_REGISTER, years: 1, privacy: true }),
  });
  const regData = await regRes.json();
  console.log('Registration result:', JSON.stringify(regData, null, 2));
} else {
  console.log('Domain not available or error.');
}
