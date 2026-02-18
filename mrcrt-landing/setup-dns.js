#!/usr/bin/env node

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://api.conway.domains';
const DOMAIN = 'mrcrt.xyz';
const IP_ADDRESS = '34.63.189.20';

async function main() {
  // Load Conway wallet
  const walletPath = path.join(process.env.HOME, '.conway', 'wallet.json');
  const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
  const wallet = new ethers.Wallet(walletData.privateKey);
  
  console.log('📍 Conway Wallet:', wallet.address);
  console.log('🌐 Domain:', DOMAIN);
  console.log('🎯 Target IP:', IP_ADDRESS);
  console.log('');

  // Step 1: Get nonce
  console.log('1️⃣  Requesting nonce...');
  const nonceResp = await fetch(`${API_BASE}/auth/nonce`, { method: 'POST' });
  const { nonce } = await nonceResp.json();
  console.log('   Nonce:', nonce);

  // Step 2: Create SIWE message
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

  console.log('');
  console.log('2️⃣  Signing SIWE message...');
  const signature = await wallet.signMessage(siweMessage);
  console.log('   Signature:', signature.substring(0, 20) + '...');

  // Step 3: Verify and get access token
  console.log('');
  console.log('3️⃣  Verifying signature...');
  const verifyResp = await fetch(`${API_BASE}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: siweMessage,
      signature: signature
    })
  });

  if (!verifyResp.ok) {
    const error = await verifyResp.text();
    throw new Error(`Auth failed: ${error}`);
  }

  const { access_token } = await verifyResp.json();
  console.log('   Access token:', access_token.substring(0, 30) + '...');

  // Step 4: Get current DNS records
  console.log('');
  console.log('4️⃣  Fetching current DNS records...');
  const dnsResp = await fetch(`${API_BASE}/domains/${DOMAIN}/dns`, {
    headers: { 'Authorization': `Bearer ${access_token}` }
  });

  if (!dnsResp.ok) {
    const error = await dnsResp.text();
    throw new Error(`DNS fetch failed: ${error}`);
  }

  const { records } = await dnsResp.json();
  console.log('   Current records:', records.length);
  
  // Check for existing A record for root
  const existingRoot = records.find(r => r.type === 'A' && r.host === '@');
  
  if (existingRoot) {
    console.log('   Found existing A record:', existingRoot.value);
    
    if (existingRoot.value === IP_ADDRESS) {
      console.log('   ✅ Already pointing to correct IP!');
      return;
    }
    
    // Update existing record
    console.log('');
    console.log('5️⃣  Updating existing A record...');
    const updateResp = await fetch(`${API_BASE}/domains/${DOMAIN}/dns/${existingRoot.recordId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ value: IP_ADDRESS })
    });

    if (!updateResp.ok) {
      const error = await updateResp.text();
      throw new Error(`DNS update failed: ${error}`);
    }

    console.log('   ✅ Updated A record!');
    
  } else {
    // Create new A record
    console.log('');
    console.log('5️⃣  Creating new A record...');
    const createResp = await fetch(`${API_BASE}/domains/${DOMAIN}/dns`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'A',
        host: '@',
        value: IP_ADDRESS,
        ttl: 3600
      })
    });

    if (!createResp.ok) {
      const error = await createResp.text();
      throw new Error(`DNS create failed: ${error}`);
    }

    const { recordId } = await createResp.json();
    console.log('   ✅ Created A record:', recordId);
  }

  // Also create www CNAME
  const existingWWW = records.find(r => r.type === 'CNAME' && r.host === 'www');
  
  if (!existingWWW) {
    console.log('');
    console.log('6️⃣  Creating www CNAME...');
    const cnameResp = await fetch(`${API_BASE}/domains/${DOMAIN}/dns`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'CNAME',
        host: 'www',
        value: DOMAIN,
        ttl: 3600
      })
    });

    if (!cnameResp.ok) {
      const error = await cnameResp.text();
      console.log('   ⚠️  CNAME creation failed:', error);
    } else {
      const { recordId } = await cnameResp.json();
      console.log('   ✅ Created CNAME record:', recordId);
    }
  } else {
    console.log('');
    console.log('6️⃣  www CNAME already exists');
  }

  console.log('');
  console.log('🎉 DNS configuration complete!');
  console.log('');
  console.log('DNS propagation: 5-30 minutes');
  console.log('Check: https://mrcrt.xyz (Caddy will auto-provision SSL)');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
