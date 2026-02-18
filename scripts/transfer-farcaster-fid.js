#!/usr/bin/env node
// Transfer Farcaster FID 2700953 custody using transferFor() relay pattern:
//   - Old custody (0x1348...): signs "from" authorization
//   - New custody (0x112F...): signs "to" authorization  
//   - Legacy Farcaster wallet (0xB329...): SENDS tx + pays OP gas

const {
  createWalletClient, createPublicClient, http,
  encodeAbiParameters, parseAbiParameters,
  encodeFunctionData, keccak256, toBytes
} = require('viem');
const { optimism } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(process.env.HOME, '.openclaw/.env');
const SECRETS_PATH = path.join(process.env.HOME, '.openclaw/.env.secrets.gpg');

const FID = 2700953n;
const OLD_CUSTODY = '0x134820820d4f631ff949625189950bA7B3C57e41';
const NEW_CUSTODY  = '0x112F14D7aB03111Fdf720c6Ccc720A21576F7487';
const LEGACY_ADDR  = '0xB3297706A7F0F2e0DedBc68bdB88a8c1247719e1';
const ID_REGISTRY  = '0x00000000fc6c5f01fc30151999387bb99a9f489b';
const OP_RPC = 'https://mainnet.optimism.io';

// Farcaster IdRegistry EIP-712 domain
const DOMAIN = {
  name: 'Farcaster IdRegistry',
  version: '1',
  chainId: 10,
  verifyingContract: ID_REGISTRY,
};

const TRANSFER_TYPE = {
  Transfer: [
    { name: 'fid',      type: 'uint256' },
    { name: 'to',       type: 'address' },
    { name: 'nonce',    type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
};

// transferFor ABI
const TRANSFER_FOR_ABI = [{
  name: 'transferFor',
  type: 'function',
  inputs: [
    { name: 'from',         type: 'address' },
    { name: 'to',           type: 'address' },
    { name: 'fromDeadline', type: 'uint256' },
    { name: 'fromSig',      type: 'bytes'   },
    { name: 'toDeadline',   type: 'uint256' },
    { name: 'toSig',        type: 'bytes'   },
  ],
  outputs: [],
  stateMutability: 'nonpayable',
}];

function loadEnv() {
  const data = {};
  const content = fs.readFileSync(ENV_PATH, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...rest] = trimmed.split('=');
      data[key.trim()] = rest.join('=').trim();
    }
  }
  return data;
}

function decryptSecrets() {
  const passphrase = execSync('cat ~/.openclaw/.gpg-passphrase', { encoding: 'utf8' }).trim();
  return JSON.parse(
    execSync(
      `gpg --batch --decrypt --passphrase-fd 3 "${SECRETS_PATH}" 3<<'PASSEOF'\n${passphrase}\nPASSEOF`,
      { encoding: 'utf8', shell: '/bin/bash' }
    )
  );
}

async function main() {
  console.log('=== Farcaster FID Transfer via Relay ===\n');

  const publicClient = createPublicClient({ chain: optimism, transport: http(OP_RPC) });

  console.log('→ Decrypting keys...');
  const secrets = decryptSecrets();
  const oldAccount    = privateKeyToAccount(secrets.AGENT_WALLET_PRIVATE_KEY === '0x79b7a090ed076d0618b750a847058c1ff653d1f18c2b8a6001b690a6176456a8'
    // new key is in secrets now — but we need the OLD compromised key to sign "from"
    // The OLD key was: need to get it separately
    ? (() => { throw new Error('OLD key needed — pass OLD_PRIVATE_KEY env var'); })()
    : secrets.AGENT_WALLET_PRIVATE_KEY
  );

  // Actually: AGENT_WALLET_PRIVATE_KEY in secrets is now the NEW key
  // We need the OLD key for fromSig — it must be passed via env
  const oldKey = process.env.OLD_PRIVATE_KEY;
  if (!oldKey) throw new Error('Set OLD_PRIVATE_KEY env var to the compromised wallet key');

  const newAccount    = privateKeyToAccount(secrets.AGENT_WALLET_PRIVATE_KEY);
  const oldCustody    = privateKeyToAccount(oldKey);
  const legacyAccount = privateKeyToAccount(secrets.FARCASTER_LEGACY_CUSTODY_PRIVATE_KEY);

  console.log(`  Old custody:  ${oldCustody.address}`);
  console.log(`  New custody:  ${newAccount.address}`);
  console.log(`  Gas payer:    ${legacyAccount.address}`);

  if (oldCustody.address.toLowerCase() !== OLD_CUSTODY.toLowerCase())
    throw new Error(`Old custody mismatch: got ${oldCustody.address}`);
  if (newAccount.address.toLowerCase() !== NEW_CUSTODY.toLowerCase())
    throw new Error(`New custody mismatch: got ${newAccount.address}`);

  // Get nonces
  const [oldNonce, newNonce] = await Promise.all([
    publicClient.readContract({
      address: ID_REGISTRY, abi: [{ name: 'nonces', type: 'function', inputs: [{name:'owner',type:'address'}], outputs: [{type:'uint256'}], stateMutability: 'view' }],
      functionName: 'nonces', args: [oldCustody.address],
    }),
    publicClient.readContract({
      address: ID_REGISTRY, abi: [{ name: 'nonces', type: 'function', inputs: [{name:'owner',type:'address'}], outputs: [{type:'uint256'}], stateMutability: 'view' }],
      functionName: 'nonces', args: [newAccount.address],
    }),
  ]);
  console.log(`\n  Old nonce: ${oldNonce}, New nonce: ${newNonce}`);

  // Deadline: 1 hour from now
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
  console.log(`  Deadline: ${new Date(Number(deadline) * 1000).toISOString()}`);

  // Create clients for signing
  const oldClient    = createWalletClient({ account: oldCustody,    chain: optimism, transport: http(OP_RPC) });
  const newClient    = createWalletClient({ account: newAccount,    chain: optimism, transport: http(OP_RPC) });
  const legacyClient = createWalletClient({ account: legacyAccount, chain: optimism, transport: http(OP_RPC) });

  // Sign fromSig (old custody authorizing the transfer)
  console.log('\n→ Old custody signing fromSig...');
  const fromSig = await oldClient.signTypedData({
    domain: DOMAIN,
    types: TRANSFER_TYPE,
    primaryType: 'Transfer',
    message: { fid: FID, to: NEW_CUSTODY, nonce: oldNonce, deadline },
  });
  console.log(`  fromSig: ${fromSig.slice(0, 20)}...`);

  // Sign toSig (new custody accepting the FID)
  console.log('→ New custody signing toSig...');
  const toSig = await newClient.signTypedData({
    domain: DOMAIN,
    types: TRANSFER_TYPE,
    primaryType: 'Transfer',
    message: { fid: FID, to: NEW_CUSTODY, nonce: newNonce, deadline },
  });
  console.log(`  toSig: ${toSig.slice(0, 20)}...`);

  // Check legacy balance
  const legacyBalance = await publicClient.getBalance({ address: legacyAccount.address });
  console.log(`\n  Legacy OP balance: ${Number(legacyBalance) / 1e18} ETH`);

  // Send transferFor via legacy wallet
  console.log('→ Legacy wallet calling transferFor()...');
  const hash = await legacyClient.writeContract({
    address: ID_REGISTRY,
    abi: TRANSFER_FOR_ABI,
    functionName: 'transferFor',
    args: [OLD_CUSTODY, NEW_CUSTODY, deadline, fromSig, deadline, toSig],
  });
  console.log(`  Tx: ${hash}`);

  console.log('→ Waiting for confirmation...');
  const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });
  
  const status = receipt.status === 'success' ? 'SUCCESS ✓' : 'FAILED ✗';
  console.log(`\n  Block: ${receipt.blockNumber}`);
  console.log(`  Status: ${status}`);
  console.log(`  View: https://optimistic.etherscan.io/tx/${hash}`);

  if (receipt.status === 'success') {
    console.log(`\n✓ FID ${FID} custody transferred to ${NEW_CUSTODY}`);
  }
}

main().catch(err => {
  console.error('\n✗', err.message);
  if (err.cause) console.error('  Cause:', err.cause?.message || err.cause);
  process.exit(1);
});
