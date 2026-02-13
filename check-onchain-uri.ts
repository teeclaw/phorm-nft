import 'dotenv/config';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL || 'https://mainnet.base.org');

const identityRegistryABI = [
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)'
];

const registryAddress = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';

async function checkAgent() {
  const registry = new ethers.Contract(registryAddress, identityRegistryABI, provider);
  
  console.log('Checking agent 16919...\n');
  
  const owner = await registry.ownerOf(16919);
  console.log('Owner:', owner);
  
  const uri = await registry.tokenURI(16919);
  console.log('Agent URI:', uri);
  console.log('\nURI length:', uri.length);
  
  if (uri.startsWith('data:')) {
    console.log('Type: Data URI (onchain storage)');
    console.log('First 100 chars:', uri.substring(0, 100) + '...');
  } else if (uri.startsWith('http')) {
    console.log('Type: HTTP URI');
    console.log('\nTrying to fetch...');
    try {
      const response = await fetch(uri);
      console.log('HTTP Status:', response.status);
      const text = await response.text();
      console.log('Response:', text.substring(0, 200));
    } catch (err: any) {
      console.log('Fetch error:', err.message);
    }
  } else {
    console.log('Type: Unknown');
  }
}

checkAgent().catch(console.error);
