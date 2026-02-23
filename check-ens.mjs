#!/usr/bin/env node
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
const name = 'mr-tee.eth';

try {
  const resolver = await provider.getResolver(name);
  if (!resolver) {
    console.log(`${name} is not registered`);
    process.exit(0);
  }
  
  const owner = await provider.resolveName(name);
  console.log(`Name: ${name}`);
  console.log(`Resolves to: ${owner || 'No address set'}`);
  
  // Get the actual NFT owner (registrant)
  const ensRegistry = new ethers.Contract(
    '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    ['function owner(bytes32 node) view returns (address)'],
    provider
  );
  
  const nameHash = ethers.namehash(name);
  const registrant = await ensRegistry.owner(nameHash);
  console.log(`NFT Owner: ${registrant}`);
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
