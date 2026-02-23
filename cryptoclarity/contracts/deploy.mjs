/**
 * Deploy CryptoClarityResolver to Base mainnet
 * Uses GCP KMS HSM signer (key never leaves hardware)
 */
import { ethers } from 'ethers';
import { KmsSigner } from '../../scripts/kms-signer.mjs';
import { readFileSync } from 'fs';

// Base mainnet addresses
const EAS = '0x4200000000000000000000000000000000000021';
const AGENT_REGISTRY = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';

async function main() {
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const signer = new KmsSigner(provider);
  const deployer = await signer.getAddress();

  console.log('Deployer:', deployer);
  console.log('EAS:', EAS);
  console.log('Agent Registry:', AGENT_REGISTRY);
  console.log('Owner (pause admin):', deployer);

  // Read compiled artifact
  const artifact = JSON.parse(
    readFileSync(new URL('./out/CryptoClarityResolver.sol/CryptoClarityResolver.json', import.meta.url), 'utf8')
  );

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode.object, signer);

  // Check balance
  const balance = await provider.getBalance(deployer);
  console.log('Balance:', ethers.formatEther(balance), 'ETH');

  if (process.argv.includes('--dry-run')) {
    console.log('\n--- DRY RUN --- Estimating deployment gas...');
    const deployTx = await factory.getDeployTransaction(EAS, AGENT_REGISTRY, deployer);
    const gasEstimate = await provider.estimateGas({ ...deployTx, from: deployer });
    const feeData = await provider.getFeeData();
    const cost = gasEstimate * (feeData.gasPrice || 0n);
    console.log('Estimated gas:', gasEstimate.toString());
    console.log('Estimated cost:', ethers.formatEther(cost), 'ETH');
    return;
  }

  console.log('\nDeploying CryptoClarityResolver...');
  const contract = await factory.deploy(EAS, AGENT_REGISTRY, deployer);
  console.log('Tx hash:', contract.deploymentTransaction().hash);
  console.log('Waiting for confirmation...');

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log('\n✅ CryptoClarityResolver deployed!');
  console.log('Address:', address);
  console.log('BaseScan:', `https://basescan.org/address/${address}`);
  console.log('\nConstructor args:');
  console.log('  EAS:', EAS);
  console.log('  Agent Registry:', AGENT_REGISTRY);
  console.log('  Owner:', deployer);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
