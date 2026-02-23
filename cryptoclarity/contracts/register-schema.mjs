/**
 * Register EAS schema for CryptoClarity Manifesto signing
 * Attaches the CryptoClarityResolver for on-chain verification
 */
import { ethers } from 'ethers';
import { KmsSigner } from '../../scripts/kms-signer.mjs';

// Base mainnet
const SCHEMA_REGISTRY = '0x4200000000000000000000000000000000000020';
const RESOLVER = '0xE52fD29C48e3B589328397be586977fAE1A43498';

// Schema: our 5 fields
const SCHEMA = 'string manifestoVersion,bytes32 manifestoHash,string agentId,string agentName,address agentWallet';

// Schema Registry ABI (minimal)
const ABI = [
  'function register(string schema, address resolver, bool revocable) external returns (bytes32)',
  'event Registered(bytes32 indexed uid, address indexed registerer, tuple(bytes32 uid, address resolver, bool revocable, string schema) schema)',
];

async function main() {
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const signer = new KmsSigner(provider);
  const address = await signer.getAddress();

  console.log('Registerer:', address);
  console.log('Schema:', SCHEMA);
  console.log('Resolver:', RESOLVER);
  console.log('Revocable:', false);

  const registry = new ethers.Contract(SCHEMA_REGISTRY, ABI, signer);

  if (process.argv.includes('--dry-run')) {
    const gas = await registry.register.estimateGas(SCHEMA, RESOLVER, false);
    console.log('\n--- DRY RUN --- Estimated gas:', gas.toString());
    return;
  }

  console.log('\nRegistering schema...');
  const tx = await registry.register(SCHEMA, RESOLVER, false);
  console.log('Tx hash:', tx.hash);
  console.log('Waiting for confirmation...');

  const receipt = await tx.wait();
  console.log('Confirmed in block:', receipt.blockNumber);

  // Extract schema UID from logs
  for (const log of receipt.logs) {
    try {
      const parsed = registry.interface.parseLog(log);
      if (parsed?.name === 'Registered') {
        console.log('\n✅ Schema registered!');
        console.log('Schema UID:', parsed.args[0]);
        console.log('EASScan:', `https://base.easscan.org/schema/view/${parsed.args[0]}`);
      }
    } catch {}
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
