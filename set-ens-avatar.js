const ethers = require('ethers');
require('dotenv').config();

const ENS_REGISTRY = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
const MAINNET_RPC = process.env.ETH_RPC_URL || 'https://eth.llamarpc.com';

const REGISTRY_ABI = [
  'function resolver(bytes32 node) view returns (address)',
];

const RESOLVER_ABI = [
  'function setText(bytes32 node, string key, string value) external',
  'function text(bytes32 node, string key) view returns (string)',
];

function namehash(name) {
  let node = '0x0000000000000000000000000000000000000000000000000000000000000000';
  if (name) {
    const labels = name.split('.');
    for (let i = labels.length - 1; i >= 0; i--) {
      const labelHash = ethers.keccak256(ethers.toUtf8Bytes(labels[i]));
      node = ethers.keccak256(ethers.concat([node, labelHash]));
    }
  }
  return node;
}

async function main() {
  const ensName = 'teeclaw.eth';
  const avatarUrl = 'https://i.imgur.com/QS1fJHc.jpeg';
  
  const provider = new ethers.JsonRpcProvider(MAINNET_RPC);
  const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
  
  console.log('Setting ENS avatar for:', ensName);
  console.log('Avatar URL:', avatarUrl);
  console.log('Wallet:', wallet.address);
  
  const node = namehash(ensName);
  console.log('ENS node:', node);
  
  // Get resolver address
  const registry = new ethers.Contract(ENS_REGISTRY, REGISTRY_ABI, provider);
  const resolverAddress = await registry.resolver(node);
  console.log('Resolver:', resolverAddress);
  
  if (resolverAddress === ethers.ZeroAddress) {
    console.error('No resolver set for this name');
    return;
  }
  
  // Set avatar text record
  const resolver = new ethers.Contract(resolverAddress, RESOLVER_ABI, wallet);
  
  // Check current avatar
  const currentAvatar = await resolver.text(node, 'avatar');
  console.log('Current avatar:', currentAvatar || '(none)');
  
  // Estimate gas
  const gasEstimate = await resolver.setText.estimateGas(node, 'avatar', avatarUrl);
  const gasPrice = await provider.getFeeData();
  const estimatedCost = gasEstimate * gasPrice.gasPrice / BigInt(1e18);
  console.log(`\nEstimated gas: ${gasEstimate.toString()}`);
  console.log(`Estimated cost: ~${estimatedCost.toString()} ETH`);
  
  console.log('\nSubmitting transaction...');
  const tx = await resolver.setText(node, 'avatar', avatarUrl);
  console.log('Transaction:', tx.hash);
  
  console.log('Waiting for confirmation...');
  const receipt = await tx.wait();
  console.log(`\n✅ Avatar set! Gas used: ${receipt.gasUsed.toString()}`);
  console.log(`\nView on ENS: https://app.ens.domains/${ensName}`);
}

main().catch(console.error);
