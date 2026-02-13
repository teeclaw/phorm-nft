#!/usr/bin/env node
import 'dotenv/config';
import { SDK } from 'agent0-sdk';

const sdk = new SDK({
  chainId: 8453,
  rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
  privateKey: process.env.WALLET_PRIVATE_KEY || process.env.MAIN_WALLET_PRIVATE_KEY,
});

const agentId = process.argv[2];
const value = parseInt(process.argv[3], 10);
const tag1 = process.argv[4] || undefined;
const tag2 = process.argv[5] || undefined;
const endpoint = process.argv[6] || undefined;

if (!agentId || isNaN(value)) {
  console.error('Usage: node give-feedback.mjs <agentId> <value> [tag1] [tag2] [endpoint]');
  process.exit(1);
}

console.log('📝 Feedback Preview:\n');
console.log(`Target Agent: ${agentId}`);
console.log(`Score: ${value}`);
if (tag1) console.log(`Tag 1: ${tag1}`);
if (tag2) console.log(`Tag 2: ${tag2}`);
if (endpoint) console.log(`Endpoint: ${endpoint}`);
console.log('\nSubmitting transaction...\n');

try {
  const tx = await sdk.giveFeedback(
    agentId,
    value,
    tag1,
    tag2,
    endpoint
  );

  console.log(`Transaction sent: ${tx.hash}`);
  console.log('Waiting for confirmation...\n');

  const { receipt, result: feedback } = await tx.waitConfirmed();

  console.log('✅ Feedback submitted successfully!\n');
  console.log(`Transaction: ${receipt.transactionHash}`);
  console.log(`Block: ${receipt.blockNumber}`);
  console.log(`Gas used: ${receipt.gasUsed.toString()}`);
  
} catch (error) {
  console.error('❌ Error submitting feedback:', error.message);
  process.exit(1);
}
