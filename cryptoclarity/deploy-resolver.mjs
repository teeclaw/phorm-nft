#!/usr/bin/env node
/**
 * Deploy CryptoClarityResolver to Base mainnet using GCP KMS signer.
 * 
 * Constructor args:
 *   - EAS: 0x4200000000000000000000000000000000000021
 *   - Agent Registry (ERC-8004): 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
 *   - Owner: 0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78 (KMS wallet)
 */

import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import KMS signer
const __dirname = dirname(fileURLToPath(import.meta.url));
const { KmsSigner } = await import(join(__dirname, '../scripts/kms-signer.mjs'));

// Config
const RPC_URL = 'https://mainnet.base.org';
const EAS_ADDRESS = '0x4200000000000000000000000000000000000021';
const AGENT_REGISTRY = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';
const OWNER = '0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78';

async function main() {
  console.log('Deploying CryptoClarityResolver to Base mainnet...\n');

  // Setup provider + KMS signer
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new KmsSigner(provider);
  const address = await signer.getAddress();
  console.log(`Deployer: ${address}`);

  // Check balance
  const balance = await provider.getBalance(address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  if (balance === 0n) {
    console.error('No ETH balance. Fund the wallet first.');
    process.exit(1);
  }

  // Load compiled artifact
  const artifactPath = join(__dirname, 'contracts', 'out', 'CryptoClarityResolver.sol', 'CryptoClarityResolver.json');
  const artifact = JSON.parse(readFileSync(artifactPath, 'utf8'));
  const abi = artifact.abi;
  const bytecode = artifact.bytecode.object;

  if (!bytecode || bytecode === '0x') {
    console.error('No bytecode found. Run `forge build` first.');
    process.exit(1);
  }

  console.log(`\nConstructor args:`);
  console.log(`  EAS: ${EAS_ADDRESS}`);
  console.log(`  Registry: ${AGENT_REGISTRY}`);
  console.log(`  Owner: ${OWNER}`);

  // Deploy
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  console.log('\nSending deployment tx...');
  
  const contract = await factory.deploy(EAS_ADDRESS, AGENT_REGISTRY, OWNER);
  console.log(`Tx hash: ${contract.deploymentTransaction().hash}`);
  console.log('Waiting for confirmation...');
  
  await contract.waitForDeployment();
  const deployedAddress = await contract.getAddress();
  
  console.log(`\n✅ CryptoClarityResolver deployed!`);
  console.log(`Address: ${deployedAddress}`);
  console.log(`BaseScan: https://basescan.org/address/${deployedAddress}`);
  console.log(`\nNext: Register EAS schema with this resolver attached.`);
}

main().catch(err => {
  console.error('Deployment failed:', err.message);
  process.exit(1);
});
