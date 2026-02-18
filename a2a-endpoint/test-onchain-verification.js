#!/usr/bin/env node

/**
 * Test onchain verification with real Base transactions
 */

const { verifyUSDCTransfer, USDC_ADDRESS, isTransactionUsed } = require('./onchain-verifier');

const AGENT_WALLET = '0x112F14D7aB03111Fdf720c6Ccc720A21576F7487';

async function main() {
  console.log('=== Onchain Verification Test ===\n');

  // Test 1: Check if we can connect to Base RPC
  console.log('1. Testing Base RPC connection...');
  try {
    const { ethers } = require('ethers');
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Connected to Base. Current block: ${blockNumber}\n`);
  } catch (error) {
    console.error(`❌ Failed to connect to Base RPC: ${error.message}\n`);
    process.exit(1);
  }

  // Test 2: Verify invalid tx hash (should fail)
  console.log('2. Testing invalid transaction hash...');
  try {
    const fakeHash = '0x' + '0'.repeat(64);
    const result = await verifyUSDCTransfer(fakeHash, AGENT_WALLET, 0.01);
    console.log(`Result: ${result.valid ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`Reason: ${result.reason}\n`);
  } catch (error) {
    console.error(`Error: ${error.message}\n`);
  }

  // Test 3: Check replay protection
  console.log('3. Testing replay attack prevention...');
  try {
    const testHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const isUsed = await isTransactionUsed(testHash);
    console.log(`Transaction ${testHash.slice(0, 10)}... is ${isUsed ? 'USED' : 'UNUSED'}\n`);
  } catch (error) {
    console.error(`Error: ${error.message}\n`);
  }

  // Test 4: Real transaction (if you provide one)
  if (process.argv[2]) {
    console.log('4. Testing real transaction...');
    const txHash = process.argv[2];
    const amount = parseFloat(process.argv[3] || '0.01');
    
    console.log(`TX Hash: ${txHash}`);
    console.log(`Expected Amount: ${amount} USDC`);
    console.log(`Expected Recipient: ${AGENT_WALLET}`);
    console.log('Verifying...\n');

    const result = await verifyUSDCTransfer(txHash, AGENT_WALLET, amount);
    
    if (result.valid) {
      console.log('✅ PAYMENT VERIFIED');
      console.log('Details:');
      console.log(`  From: ${result.details.from}`);
      console.log(`  To: ${result.details.to}`);
      console.log(`  Amount: ${result.details.amount} USDC`);
      console.log(`  Confirmations: ${result.details.confirmations}`);
      console.log(`  Block: ${result.details.blockNumber}`);
    } else {
      console.log('❌ PAYMENT VERIFICATION FAILED');
      console.log(`Reason: ${result.reason}`);
    }
  } else {
    console.log('4. Skipping real transaction test (no tx hash provided)');
    console.log('   Usage: node test-onchain-verification.js <tx_hash> [amount]');
  }

  console.log('\n=== Test Complete ===');
}

main().catch(console.error);
