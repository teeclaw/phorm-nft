import 'dotenv/config';
import { SDK } from 'agent0-sdk';

async function main() {
  const agentId = '8453:16919';
  const burnAddress = '0x000000000000000000000000000000000000dEaD';
  
  console.log('Initializing SDK...');
  
  // OpenClaw's dotenv automatically decrypts GPG-prefixed values
  const privateKey = process.env.MAIN_WALLET_PRIVATE_KEY!;
  
  if (!privateKey || !privateKey.startsWith('0x')) {
    throw new Error('MAIN_WALLET_PRIVATE_KEY not found or invalid');
  }
  
  const sdk = new SDK({
    chainId: 8453,
    rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    privateKey: privateKey,
  });
  
  // Step 1: Verify current ownership
  console.log('\n=== Current Ownership ===');
  const currentOwner = await sdk.getAgentOwner(agentId);
  console.log(`Current owner: ${currentOwner}`);
  console.log(`Main wallet: ${process.env.MAIN_WALLET_ADDRESS}`);
  
  if (currentOwner.toLowerCase() !== process.env.MAIN_WALLET_ADDRESS?.toLowerCase()) {
    throw new Error('Wallet does not own this agent');
  }
  
  // Step 2: Preview
  console.log('\n=== Transfer Preview ===');
  console.log(`Agent ID: ${agentId}`);
  console.log(`Current Owner: ${currentOwner}`);
  console.log(`New Owner: ${burnAddress} (BURN ADDRESS)`);
  console.log('\n⚠️  WARNING: This will permanently burn the agent identity.');
  console.log('The agent will be transferred to an address that no one controls.');
  console.log('This action is IRREVERSIBLE.');
  
  // If running with --execute flag, proceed with transfer
  if (process.argv.includes('--execute')) {
    console.log('\n=== Executing Transfer ===');
    
    const txHandle = await sdk.transferAgent(agentId, burnAddress);
    console.log(`Transaction hash: ${txHandle.hash}`);
    console.log('Waiting for confirmation...');
    
    const { result, receipt } = await txHandle.waitConfirmed();
    console.log('\n=== Transfer Confirmed ===');
    console.log(`Block: ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed?.toString() || 'N/A'}`);
    console.log(`From: ${result.from}`);
    console.log(`To: ${result.to}`);
    
    // Step 3: Verify new ownership
    console.log('\n=== Verifying New Ownership ===');
    const verifiedOwner = await sdk.getAgentOwner(agentId);
    console.log(`New owner: ${verifiedOwner}`);
    
    if (verifiedOwner.toLowerCase() === burnAddress.toLowerCase()) {
      console.log('✅ Transfer successful - agent burned');
    } else {
      console.log('❌ Verification failed - owner mismatch');
    }
  } else {
    console.log('\n→ Run with --execute flag to proceed with the transfer');
  }
}

main().catch(console.error);
