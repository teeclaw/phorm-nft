#!/usr/bin/env node
// Phase 2: Authorize Blankspace as Signer for Farcaster FID 2684290

const { ed25519 } = require('@noble/curves/ed25519');
const { bytesToHex, hexToBytes, createWalletClient, createPublicClient, http } = require('viem');
const { optimism } = require('viem/chains');
const { mnemonicToAccount } = require('viem/accounts');
const fs = require('fs');
const path = require('path');

const BLANKSPACE_API = 'https://sljlmfmrtiqyutlxcnbo.supabase.co/functions/v1/register-agent';
const CREDS_PATH = path.join(process.env.HOME, '.openclaw/farcaster-credentials.json');

async function main() {
  console.log('📺 Phase 2: Authorize Blankspace Signer\n');

  // Load existing credentials
  const creds = JSON.parse(fs.readFileSync(CREDS_PATH, 'utf8'));
  const custodyPrivateKey = creds.custodyPrivateKey;
  const custodyAddress = creds.custodyAddress;
  const fid = parseInt(creds.fid);

  console.log(`FID: ${fid}`);
  console.log(`Custody Address: ${custodyAddress}\n`);

  // Step 1: Generate ED25519 signer keypair
  console.log('Step 1: Generating ED25519 signer keypair...');
  const signerPrivKey = ed25519.utils.randomPrivateKey();
  const signerPubKey = ed25519.getPublicKey(signerPrivKey);
  const signerPrivateKey = bytesToHex(signerPrivKey);
  const signerPublicKey = bytesToHex(signerPubKey);
  console.log(`✅ Signer Public Key: ${signerPublicKey}\n`);

  // Step 2: Request signer authorization
  console.log('Step 2: Requesting signer authorization from Blankspace...');
  const response = await fetch(BLANKSPACE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'create-signer-request',
      custodyAddress,
      signerPublicKey,
    }),
  });

  const authData = await response.json();
  console.log('Response:', JSON.stringify(authData, null, 2));

  if (!authData.identityPublicKey) {
    console.error('❌ Failed to get authorization data');
    return;
  }

  const { identityPublicKey, metadata, deadline, keyGatewayAddress } = authData;
  console.log(`✅ Identity Public Key: ${identityPublicKey}`);
  console.log(`✅ Key Gateway: ${keyGatewayAddress}\n`);

  // Save signer keys
  creds.signerPrivateKey = signerPrivateKey;
  creds.signerPublicKey = signerPublicKey;
  creds.identityPublicKey = identityPublicKey;
  fs.writeFileSync(CREDS_PATH, JSON.stringify(creds, null, 2));
  console.log('✅ Saved signer keys to credentials\n');

  // Step 3: Submit on-chain transaction
  console.log('Step 3: Submitting KeyGateway.add() transaction on Optimism...');
  
  const { privateKeyToAccount } = require('viem/accounts');
  const custodyAccount = privateKeyToAccount(custodyPrivateKey);

  const walletClient = createWalletClient({
    account: custodyAccount,
    chain: optimism,
    transport: http(),
  });

  const publicClient = createPublicClient({
    chain: optimism,
    transport: http(),
  });

  const keyGatewayAbi = [{
    inputs: [
      { name: 'keyType', type: 'uint32' },
      { name: 'key', type: 'bytes' },
      { name: 'metadataType', type: 'uint8' },
      { name: 'metadata', type: 'bytes' },
    ],
    name: 'add',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  }];

  try {
    const txHash = await walletClient.writeContract({
      address: keyGatewayAddress,
      abi: keyGatewayAbi,
      functionName: 'add',
      args: [1, signerPublicKey, 1, metadata],
    });

    console.log(`✅ Transaction submitted: ${txHash}`);
    console.log('⏳ Waiting for confirmation...');

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log(`✅ Confirmed in block: ${receipt.blockNumber}\n`);

    // Step 4: Complete registration
    console.log('Step 4: Completing registration with Blankspace...');
    const completeResponse = await fetch(BLANKSPACE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'complete-registration',
        custodyAddress,
        signerPublicKey,
        txHash,
      }),
    });

    const result = await completeResponse.json();
    console.log('Result:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n🎉 Phase 2 Complete! Blankspace signer authorized.');
      console.log('Next: Set username and profile (Phase 3)');
    }
  } catch (error) {
    console.error('❌ Transaction failed:', error.message);
    console.error('Full error:', error);
  }
}

main().catch(console.error);
