#!/usr/bin/env node

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://api.conway.domains';
const DOMAIN = 'mrcrt.xyz';
const IP_ADDRESS = '34.63.189.20';

async function getAuth() {
  const walletPath = path.join(process.env.HOME, '.conway', 'wallet.json');
  const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
  const wallet = new ethers.Wallet(walletData.privateKey);
  
  const nonceResp = await fetch(`${API_BASE}/auth/nonce`, { method: 'POST' });
  const { nonce } = await nonceResp.json();
  
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
  
  const verifyResp = await fetch(`${API_BASE}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: siweMessage, signature })
  });

  const { access_token } = await verifyResp.json();
  return access_token;
}

async function main() {
  const token = await getAuth();
  
  const dnsResp = await fetch(`${API_BASE}/domains/${DOMAIN}/dns`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const { records } = await dnsResp.json();
  
  console.log('Current DNS records:');
  console.log('');
  records.forEach(r => {
    if (r.host === '@' || r.host === 'www') {
      console.log(`${r.host.padEnd(10)} ${r.type.padEnd(6)} → ${r.value}`);
      console.log(`           ID: ${r.recordId}`);
    }
  });
  
  const wwwRecord = records.find(r => r.host === 'www');
  
  if (wwwRecord && wwwRecord.value !== IP_ADDRESS) {
    console.log('');
    console.log(`Updating www record from ${wwwRecord.value} to ${IP_ADDRESS}...`);
    
    const updateResp = await fetch(`${API_BASE}/domains/${DOMAIN}/dns/${wwwRecord.recordId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ value: IP_ADDRESS })
    });

    if (!updateResp.ok) {
      const error = await updateResp.text();
      console.log('❌ Update failed:', error);
    } else {
      console.log('✅ Updated!');
    }
  } else if (wwwRecord) {
    console.log('');
    console.log('✅ www already pointing to correct IP');
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
