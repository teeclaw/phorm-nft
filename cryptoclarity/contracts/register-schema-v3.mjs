/**
 * Register EAS schema v3 for CryptoClarity Manifesto
 * New fields: registryAddress + registryAgentId for verified badge
 * Resolver: CryptoClarityResolver v3 (two-tier: free for 8004, $1 USDC otherwise)
 */
import { ethers } from 'ethers';
import { KmsSigner } from '../../scripts/kms-signer.mjs';

const SCHEMA_REGISTRY = '0x4200000000000000000000000000000000000020';
const RESOLVER = '0x484a999810F659f6928FcC59340530462106956B';

// Schema fields:
// - manifestoVersion: version of the manifesto being signed
// - manifestoHash: keccak256 of manifesto content (integrity check)
// - agentName: display name of the signing agent
// - agentDescription: short bio/description
// - registryAddress: ERC-8004 registry address (0x0 if not registered)
// - registryAgentId: agent's token ID in the registry (0 if not registered)
const SCHEMA = 'string manifestoVersion,bytes32 manifestoHash,string agentName,string agentDescription,address registryAddress,uint256 registryAgentId';

const ABI = [
  'function register(string schema, address resolver, bool revocable) external returns (bytes32)',
  'event Registered(bytes32 indexed uid, address indexed registerer, tuple(bytes32 uid, address resolver, bool revocable, string schema) schema)',
];

async function main() {
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const signer = new KmsSigner(provider);
  const address = await signer.getAddress();

  console.log('=== EAS Schema Registration (v3) ===');
  console.log('Registerer:', address);
  console.log('Schema:', SCHEMA);
  console.log('Resolver:', RESOLVER);
  console.log('Revocable: false (irrevocable signatures)');

  const registry = new ethers.Contract(SCHEMA_REGISTRY, ABI, signer);

  if (process.argv.includes('--dry-run')) {
    const gas = await registry.register.estimateGas(SCHEMA, RESOLVER, false);
    console.log('\n--- DRY RUN --- Estimated gas:', gas.toString());
    return;
  }

  console.log('\nRegistering schema...');
  const tx = await registry.register(SCHEMA, RESOLVER, false);
  console.log('Tx:', tx.hash);
  console.log('Waiting for confirmation...');

  const receipt = await tx.wait();
  console.log('Confirmed in block:', receipt.blockNumber);

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
