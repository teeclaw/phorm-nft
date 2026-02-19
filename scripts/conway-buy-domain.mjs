#!/usr/bin/env node
/**
 * Buy a domain via Conway Domains API
 * Uses the same SIWE auth + x402 payment flow as conway-terminal
 */

// Use conway-terminal's own modules
const CONWAY_PKG = '/home/phan_harry/.npm/_npx/e32e96c087c8e544/node_modules/conway-terminal/dist';
const DOMAIN_API_URL = 'https://api.conway.domains';
const DOMAIN = process.argv[2] || 'payattention.wtf';

const { getWallet } = await import(`${CONWAY_PKG}/wallet.js`);
const { x402Fetch, getUsdcBalance } = await import(`${CONWAY_PKG}/x402/index.js`);
const { SiweMessage } = await import('/home/phan_harry/.npm/_npx/e32e96c087c8e544/node_modules/siwe/dist/index.js');

const { account } = await getWallet();
console.log(`Wallet: ${account.address}`);

// Check USDC balance
console.log('\n[1/4] Checking USDC balance...');
const bal = await getUsdcBalance(account.address, 'eip155:8453');
console.log(`USDC Balance on Base: $${(Number(bal) / 1e6).toFixed(2)}`);

// SIWE auth
console.log('\n[2/4] SIWE auth with Conway Domains...');
const nonceResp = await fetch(`${DOMAIN_API_URL}/auth/nonce`, { method: 'POST' });
if (!nonceResp.ok) throw new Error(`Nonce failed: ${nonceResp.status} ${await nonceResp.text()}`);
const { nonce } = await nonceResp.json();
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
console.log('Authenticated ✓');

// Check domain
console.log(`\n[3/4] Checking ${DOMAIN}...`);
const checkResp = await fetch(`${DOMAIN_API_URL}/domains/check?domains=${DOMAIN}`, {
  headers: { Authorization: `Bearer ${access_token}` },
});
const checkData = await checkResp.json();
const domainInfo = checkData.domains?.[0];
if (!domainInfo) throw new Error('No domain info returned');
console.log(`Available: ${domainInfo.available}`);
console.log(`Price: $${domainInfo.price} ${domainInfo.currency}`);
if (!domainInfo.available) throw new Error('Domain not available!');

// Register with x402 payment
console.log(`\n[4/4] Registering ${DOMAIN} (x402 payment ~$${domainInfo.price})...`);
const result = await x402Fetch(account, `${DOMAIN_API_URL}/domains/register`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ domain: DOMAIN, years: 1, privacy: true }),
});
const regData = await result.json();
console.log('\nResult:');
console.log(JSON.stringify(regData, null, 2));
