/**
 * Deploy CryptoClarityResolver v3 to Base mainnet
 * - Two-tier signing: ERC-8004 agents free, everyone else $1 USDC
 * - Owner: cold wallet (0x168D...)
 * - Treasury: Safe wallet (0xFdF5...)
 * - Deployer: KMS HSM (0x1Af5...)
 */
import { ethers } from 'ethers';
import { KmsSigner } from '../../scripts/kms-signer.mjs';
import { readFileSync } from 'fs';

// Base mainnet constants
const EAS = '0x4200000000000000000000000000000000000021';
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const TREASURY = '0xFdF53De20f46bAE2Fa6414e6F25EF1654E68Acd0';
const OWNER = '0x168D8b4f50BB3aA67D05a6937B643004257118ED';

// Trusted ERC-8004 registries
const REGISTRY_MAIN = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';
const REGISTRY_ZSCORE = '0xFfE9395fa761e52DBC077a2e7Fd84f77e8abCc41';

async function main() {
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const signer = new KmsSigner(provider);
  const deployer = await signer.getAddress();

  console.log('=== CryptoClarityResolver v3 Deployment ===');
  console.log('Deployer (KMS):', deployer);
  console.log('Owner (cold):', OWNER);
  console.log('Treasury (Safe):', TREASURY);
  console.log('USDC:', USDC);
  console.log('Registries:', [REGISTRY_MAIN, REGISTRY_ZSCORE]);

  const balance = await provider.getBalance(deployer);
  console.log('Deployer ETH:', ethers.formatEther(balance));

  if (balance === 0n) {
    console.error('ERROR: Deployer has no ETH for gas');
    process.exit(1);
  }

  const artifact = JSON.parse(
    readFileSync(
      new URL('./out/CryptoClarityResolver.sol/CryptoClarityResolver.json', import.meta.url),
      'utf8'
    )
  );

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode.object, signer);
  const constructorArgs = [EAS, USDC, TREASURY, OWNER, [REGISTRY_MAIN, REGISTRY_ZSCORE]];

  if (process.argv.includes('--dry-run')) {
    console.log('\n--- DRY RUN ---');
    const deployTx = await factory.getDeployTransaction(...constructorArgs);
    const gas = await provider.estimateGas({ ...deployTx, from: deployer });
    const feeData = await provider.getFeeData();
    const cost = gas * (feeData.gasPrice || 0n);
    console.log('Estimated gas:', gas.toString());
    console.log('Estimated cost:', ethers.formatEther(cost), 'ETH');
    console.log('--- END DRY RUN ---');
    return;
  }

  console.log('\nDeploying...');
  const contract = await factory.deploy(...constructorArgs);
  const tx = contract.deploymentTransaction();
  console.log('Tx:', tx.hash);
  console.log('Waiting for confirmation...');

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log('\n✅ CryptoClarityResolver v3 deployed!');
  console.log('Address:', address);
  console.log('BaseScan:', `https://basescan.org/address/${address}`);
  console.log('Tx:', `https://basescan.org/tx/${tx.hash}`);

  // Verify state
  const resolverContract = new ethers.Contract(address, artifact.abi, provider);
  console.log('\n--- Post-deploy verification ---');
  console.log('Owner:', await resolverContract.owner());
  console.log('Treasury:', await resolverContract.treasury());
  console.log('Signing fee:', (await resolverContract.signingFee()).toString(), '($1 USDC)');
  console.log('Registry count:', (await resolverContract.registryCount()).toString());
  console.log('Paused:', await resolverContract.paused());
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
