#!/usr/bin/env node
// EIP-7702 revocation via relay pattern:
//   - Compromised wallet: signs the revocation authorization
//   - Legacy Farcaster wallet: SENDS and PAYS GAS for the tx
// This is safe because the attacker's sweeper can't drain the legacy wallet.

const { createWalletClient, createPublicClient, http } = require('viem');
const { base } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(process.env.HOME, '.openclaw/.env');
const SECRETS_PATH = path.join(process.env.HOME, '.openclaw/.env.secrets.gpg');
const COMPROMISED = '0x134820820d4f631ff949625189950bA7B3C57e41';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const RPC = 'https://mainnet.base.org';

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
  const env = loadEnv();
  const passphrase = env.OPENCLAW_GPG_PASSPHRASE;
  if (!passphrase) throw new Error('OPENCLAW_GPG_PASSPHRASE not found');
  return JSON.parse(
    execSync(
      `gpg --batch --decrypt --passphrase-fd 3 "${SECRETS_PATH}" 3<<'PASSEOF'\n${passphrase}\nPASSEOF`,
      { encoding: 'utf8', shell: '/bin/bash' }
    )
  );
}

async function main() {
  console.log('=== EIP-7702 Relay Revocation ===');
  console.log('  Strategy: legacy wallet pays gas, compromised wallet signs authorization\n');

  const publicClient = createPublicClient({ chain: base, transport: http(RPC) });

  // 1. Decrypt both keys
  console.log('→ Decrypting keys...');
  const secrets = decryptSecrets();
  const mainKey = secrets.AGENT_WALLET_PRIVATE_KEY;
  const legacyKey = secrets.FARCASTER_LEGACY_CUSTODY_PRIVATE_KEY;

  const mainAccount = privateKeyToAccount(mainKey);
  const legacyAccount = privateKeyToAccount(legacyKey);

  console.log(`  Compromised (auth signer): ${mainAccount.address}`);
  console.log(`  Legacy (gas payer):        ${legacyAccount.address}`);

  // 2. Check legacy balance (this pays gas — attacker can't touch it)
  const legacyBalance = await publicClient.getBalance({ address: legacyAccount.address });
  console.log(`  Legacy balance: ${Number(legacyBalance) / 1e18} ETH`);
  if (legacyBalance === 0n) throw new Error('Legacy wallet has no ETH for gas');

  // 3. Create clients
  // The compromised account is used ONLY for signing the authorization (not sending tx)
  const mainClient = createWalletClient({ account: mainAccount, chain: base, transport: http(RPC) });
  // The legacy account SENDS and PAYS for the transaction
  const legacyClient = createWalletClient({ account: legacyAccount, chain: base, transport: http(RPC) });

  // 4. Compromised wallet signs the revocation authorization
  console.log('\n→ Compromised wallet signing revocation authorization...');
  console.log('  (delegating to address(0) = revoke)');
  const authorization = await mainClient.signAuthorization({
    contractAddress: ZERO_ADDRESS,
  });
  console.log(`  Signed: nonce=${authorization.nonce}, chainId=${authorization.chainId}`);
  console.log(`  Signer: ${authorization.address || mainAccount.address}`);

  // 5. Legacy wallet submits the EIP-7702 transaction (pays gas)
  console.log('\n→ Legacy wallet broadcasting revocation tx (paying gas)...');
  const hash = await legacyClient.sendTransaction({
    authorizationList: [authorization],
    to: COMPROMISED,   // target is the compromised wallet
    value: 0n,
    data: '0x',
  });
  console.log(`  Tx hash: ${hash}`);

  // 6. Wait for confirmation
  console.log('→ Waiting for confirmation...');
  const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });

  const status = receipt.status === 'success' ? 'SUCCESS ✓' : 'FAILED ✗';
  console.log(`\n  Block: ${receipt.blockNumber}`);
  console.log(`  Status: ${status}`);
  console.log(`  View: https://basescan.org/tx/${hash}`);

  if (receipt.status === 'success') {
    console.log('\n=== Delegation revoked ===');
    console.log(`  ${COMPROMISED} is no longer delegated to the malicious contract`);
    console.log('⚠️  Wallet is still compromised (private key known by attacker). Do NOT send funds.');
  } else {
    console.log('\n✗ Revocation failed. Check tx for details.');
  }
}

main().catch(err => {
  console.error('\n✗ Error:', err.message);
  if (err.shortMessage) console.error('  Short:', err.shortMessage);
  process.exit(1);
});
