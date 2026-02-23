/**
 * Deploy CryptoClarityResolver v2 to Base mainnet
 * Owner set to 0x168d8b4f50bb3aa67d05a6937b643004257118ed
 */
import { ethers } from 'ethers';
import { KmsSigner } from '../../scripts/kms-signer.mjs';
import { readFileSync } from 'fs';

const EAS = '0x4200000000000000000000000000000000000021';
const AGENT_REGISTRY = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';
const OWNER = '0x168d8b4f50bb3aa67d05a6937b643004257118ed';

async function main() {
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const signer = new KmsSigner(provider);
  const deployer = await signer.getAddress();

  console.log('Deployer:', deployer);
  console.log('Owner (pause admin):', OWNER);

  const artifact = JSON.parse(
    readFileSync(new URL('./out/CryptoClarityResolver.sol/CryptoClarityResolver.json', import.meta.url), 'utf8')
  );

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode.object, signer);

  if (process.argv.includes('--dry-run')) {
    const deployTx = await factory.getDeployTransaction(EAS, AGENT_REGISTRY, OWNER);
    const gas = await provider.estimateGas({ ...deployTx, from: deployer });
    console.log('Estimated gas:', gas.toString());
    return;
  }

  console.log('\nDeploying...');
  const contract = await factory.deploy(EAS, AGENT_REGISTRY, OWNER);
  console.log('Tx:', contract.deploymentTransaction().hash);

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log('\n✅ Deployed:', address);
  console.log('BaseScan:', `https://basescan.org/address/${address}`);
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
