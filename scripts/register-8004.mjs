/**
 * Register Mr. Tee on ERC-8004 (fully onchain, data: URI)
 * Uses GCP KMS HSM signer — key never leaves hardware
 */
import { ethers } from 'ethers';
import { KmsSigner } from './kms-signer.mjs';
import { readFileSync } from 'fs';

const IDENTITY_REGISTRY = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';

// Minimal ABI for register(string) → uint256
const ABI = [
  'function register(string agentURI) external returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];

async function main() {
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const signer = new KmsSigner(provider);
  const address = await signer.getAddress();

  console.log('Wallet:', address);

  // Read draft JSON
  const draftPath = new URL('../erc-8004-draft.json', import.meta.url).pathname;
  const draft = JSON.parse(readFileSync(draftPath, 'utf8'));
  console.log('Agent name:', draft.name);
  console.log('Services:', draft.services.map(s => s.name).join(', '));

  // Encode as data: URI (fully onchain)
  const jsonStr = JSON.stringify(draft);
  const b64 = Buffer.from(jsonStr).toString('base64');
  const dataUri = `data:application/json;base64,${b64}`;
  console.log('Data URI length:', dataUri.length, 'bytes');

  // Connect to IdentityRegistry
  const registry = new ethers.Contract(IDENTITY_REGISTRY, ABI, signer);

  // Estimate gas first
  const gasEstimate = await registry.register.estimateGas(dataUri);
  console.log('Estimated gas:', gasEstimate.toString());

  const feeData = await provider.getFeeData();
  const estimatedCost = gasEstimate * (feeData.gasPrice || 0n);
  console.log('Estimated cost:', ethers.formatEther(estimatedCost), 'ETH');

  // Check for --dry-run flag
  if (process.argv.includes('--dry-run')) {
    console.log('\n--- DRY RUN --- No transaction submitted.');
    console.log('Data URI preview (first 200 chars):', dataUri.slice(0, 200) + '...');
    return;
  }

  // Submit registration
  console.log('\nSubmitting registration...');
  const tx = await registry.register(dataUri);
  console.log('Tx hash:', tx.hash);
  console.log('Waiting for confirmation...');

  const receipt = await tx.wait();
  console.log('Confirmed in block:', receipt.blockNumber);
  console.log('Gas used:', receipt.gasUsed.toString());

  // Extract agent ID from Transfer event (mint: from=0x0 to=signer)
  const transferLog = receipt.logs.find(log => {
    try {
      const parsed = registry.interface.parseLog(log);
      return parsed?.name === 'Transfer';
    } catch { return false; }
  });

  if (transferLog) {
    const parsed = registry.interface.parseLog(transferLog);
    const tokenId = parsed.args.tokenId.toString();
    console.log('\n✅ Registered!');
    console.log('Agent ID: 8453:' + tokenId);
    console.log('BaseScan: https://basescan.org/nft/' + IDENTITY_REGISTRY + '/' + tokenId);
  } else {
    console.log('\n✅ Tx confirmed but could not parse agent ID from logs');
    console.log('Check BaseScan: https://basescan.org/tx/' + tx.hash);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
