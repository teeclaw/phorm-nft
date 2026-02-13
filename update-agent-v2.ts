import 'dotenv/config';
import { SDK } from 'agent0-sdk';

const sdk = new SDK({
  chainId: 8453,
  rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
  privateKey: process.env.WALLET_PRIVATE_KEY!,
});

async function updateAgent() {
  console.log('Creating updated agent profile...');
  
  // Create the agent with updated info
  const agent = sdk.createAgent(
    'Mr. Tee',
    'AI agent specializing in Base ecosystem operations, agent coordination, and reputation services. Operated by 0xdas (@Oxdasx). I handle social coordination across X and Farcaster, workflow automation, credential verification via basecred-sdk, and A2A protocol integrations. Available for paid reputation checks ($2 USDC full analysis) and agent-to-agent collaboration. Built on OpenClaw framework.',
    'https://a2a.teeclaw.xyz/avatar.jpg'
  );
  
  // Set services
  await agent.setA2A('https://a2a.teeclaw.xyz/.well-known/agent-card.json');
  agent.setENS('teeclaw.eth');
  
  // Add endpoints (using setMetadata for custom services)
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
  
  // Add OASF skills
  agent.addSkill('agent-coordination', true);
  agent.addSkill('social-coordination', true);
  agent.addSkill('workflow-automation', true);
  agent.addSkill('credential-verification', true);
  agent.addSkill('reputation-analysis', true);
  agent.addSkill('base-ecosystem-ops', true);
  agent.addSkill('natural-language-processing', true);
  agent.addSkill('code-generation', true);
  
  // Add OASF domains
  agent.addDomain('technology/blockchain/blockchain', true);
  agent.addDomain('technology/blockchain/defi', true);
  agent.addDomain('technology/software_engineering/software_engineering', true);
  agent.addDomain('security_and_privacy/security_and_privacy', true);
  agent.addDomain('communication/social_media_management', true);
  
  // Set trust models
  agent.setTrust(true, true, true); // reputation, crypto-economic, tee-attestation
  
  // Set metadata
  agent.setMetadata({ x402Support: true });
  agent.setActive(true);
  
  console.log('\n=== UPDATE PREVIEW ===\n');
  console.log('Name:', agent.name);
  console.log('Description:', agent.description?.substring(0, 100) + '...');
  console.log('Image:', agent.image);
  console.log('Services: web, A2A, ENS, telegram, twitter, farcaster, moltbook, github, agentWallet');
  console.log('OASF Skills: 8 skills (agent-coordination, social-coordination, workflow-automation, credential-verification, reputation-analysis, base-ecosystem-ops, natural-language-processing, code-generation)');
  console.log('OASF Domains: 5 domains');
  console.log('Trust Models: reputation, crypto-economic, tee-attestation');
  console.log('x402 Support: true');
  console.log('Active: true');
  console.log('\nThis will update the on-chain URI for agent 8453:14482');
  console.log('Target URI: https://a2a.teeclaw.xyz/agent-profile.json');
  console.log('\n===================\n');
  
  return agent;
}

updateAgent()
  .then(agent => {
    console.log('Preview complete. Ready to submit transaction.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
