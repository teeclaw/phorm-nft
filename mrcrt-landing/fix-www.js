#!/usr/bin/env node

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://api.conway.domains';
const DOMAIN = 'mrcrt.xyz';
const IP_ADDRESS = '34.63.189.20';
const WWW_RECORD_ID = 'e846eb0cc56c0e09da012ab540ad5857';

async function main() {
  // Load Conway wallet
  const walletPath = path.join(process.env.HOME, '.conway', 'wallet.json');
  const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
  const wallet = new ethers.Wallet(walletData.privateKey);
  
  console.log('📍 Updating www A record...');

  // Get nonce
  const nonceResp = await fetch(`${API_BASE}/auth/nonce`, { method: 'POST' });
  const { nonce } = await nonceResp.json();

  // Create SIWE message
  const domain = 'api.conway.domains';
  const uri = 'https://api.conway.domains';
  const issuedAt = new Date().toISOString();
  
  const siweMessage = `${domain} wants you to sign in with your Ethereum account:
${wallet.address}

Sign in to Conway Domains

URI: ${uri}
Version: 1
Chain ID: 8453
Nonce: ${nonce}
Issued At: ${issuedAt}`;

  const signature = await wallet.signMessage(siweMessage);

  // Verify
  const verifyResp = await fetch(`${API_BASE}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: siweMessage, signature })
  });

  const { access_token } = await verifyResp.json();

  // Update www record
  const updateResp = await fetch(`${API_BASE}/domains/${DOMAIN}/dns/${WWW_RECORD_ID}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ value: IP_ADDRESS })
  });

  if (!updateResp.ok) {
    const error = await updateResp.text();
    throw new Error(`Update failed: ${error}`);
  }

  console.log('✅ Updated www A record to', IP_ADDRESS);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
