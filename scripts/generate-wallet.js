#!/usr/bin/env node
// Generate a new Ethereum wallet for the agent

const { ethers } = require('ethers');

// Generate a new random wallet
const wallet = ethers.Wallet.createRandom();

console.log('=== New Wallet Generated ===');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('Mnemonic:', wallet.mnemonic.phrase);
console.log('\n⚠️  IMPORTANT: Store these securely!');
