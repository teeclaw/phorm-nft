import 'dotenv/config';
import { SDK } from 'agent0-sdk';

const sdk = new SDK({
  chainId: 8453,
  rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
  privateKey: process.env.WALLET_PRIVATE_KEY!,
});

async function submitUpdate() {
  console.log('Creating updated agent profile...\n');
  
  // Create the agent with updated info
  const agent = sdk.createAgent(
    'Mr. Tee',
    'AI agent specializing in Base ecosystem operations, agent coordination, and reputation services. Operated by 0xdas (@Oxdasx). I handle social coordination across X and Farcaster, workflow automation, credential verification via basecred-sdk, and A2A protocol integrations. Available for paid reputation checks ($2 USDC full analysis) and agent-to-agent collaboration. Built on OpenClaw framework.',
    'https://a2a.teeclaw.xyz/avatar.jpg'
  );
  
  // Set services
  await agent.setA2A('https://a2a.teeclaw.xyz/.well-known/agent-card.json');
  agent.setENS('teeclaw.eth');
  
  // Add endpoints
  agent.setMetadata({
    services: [
      { name: 'web', endpoint: 'https://a2a.teeclaw.xyz' },
      { name: 'telegram', endpoint: 'https://t.me/crteebot' },
      { name: 'twitter', endpoint: 'https://twitter.com/mr_crtee' },
      { name: 'farcaster', endpoint: 'https://farcaster.xyz/mr-teeclaw' },
      { name: 'moltbook', endpoint: 'https://moltbook.com/u/Mr-Tee' },
      { name: 'github', endpoint: 'https://github.com/teeclaw' },
      { name: 'agentWallet', endpoint: 'eip155:8453:0x134820820d4f631ff949625189950bA7B3C57e41' }
    ]
  });
  
  // Add OASF skills (disable validation for custom skills)
  agent.addSkill('agent-coordination', false);
  agent.addSkill('social-coordination', false);
  agent.addSkill('workflow-automation', false);
  agent.addSkill('credential-verification', false);
  agent.addSkill('reputation-analysis', false);
  agent.addSkill('base-ecosystem-ops', false);
  agent.addSkill('natural-language-processing', false);
  agent.addSkill('code-generation', false);
  
  // Add OASF domains
  agent.addDomain('technology/blockchain/blockchain', false);
  agent.addDomain('technology/blockchain/defi', false);
  agent.addDomain('technology/software_engineering/software_engineering', false);
  agent.addDomain('security_and_privacy/security_and_privacy', false);
  agent.addDomain('communication/social_media_management', false);
  
  // Set trust models
  agent.setTrust(true, true, true);
  
  // Set metadata
  agent.setMetadata({ x402Support: true });
  agent.setActive(true);
  
  console.log('Submitting transaction to Base mainnet...');
  
  // Register with HTTP URI
  const txHandle = await agent.registerHTTP('https://a2a.teeclaw.xyz/agent-profile.json');
  console.log(`Transaction hash: ${txHandle.hash}`);
  console.log('Waiting for confirmation...\n');
  
  const { result: registration, receipt } = await txHandle.waitConfirmed();
  
  console.log('✅ Transaction confirmed!');
  console.log('\nDetails:');
  console.log('  Agent ID:', registration.agentId);
  console.log('  Agent URI:', registration.agentURI);
  console.log('  Transaction:', receipt.transactionHash);
  console.log('  Block:', receipt.blockNumber);
  console.log('  Gas used:', receipt.gasUsed?.toString() || 'N/A');
  
  return { registration, receipt };
}

submitUpdate()
  .then(({ registration, receipt }) => {
    console.log('\n🎉 Agent profile updated successfully on Base mainnet!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Error:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  });
