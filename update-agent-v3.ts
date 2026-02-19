import 'dotenv/config';
import { SDK } from 'agent0-sdk';

const sdk = new SDK({
  chainId: 8453,
  rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
  privateKey: process.env.AGENT_WALLET_PRIVATE_KEY!,
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
  
  // Add OASF skills (disable validation for custom skills)
  agent.addSkill('agent-coordination', false);
  agent.addSkill('social-coordination', false);
  agent.addSkill('workflow-automation', false);
  agent.addSkill('credential-verification', false);
  agent.addSkill('reputation-analysis', false);
  agent.addSkill('base-ecosystem-ops', false);
  agent.addSkill('natural-language-processing', false);
  agent.addSkill('code-generation', false);
  
  // Add OASF domains (disable validation for custom domains)
  agent.addDomain('technology/blockchain/blockchain', false);
  agent.addDomain('technology/blockchain/defi', false);
  agent.addDomain('technology/software_engineering/software_engineering', false);
  agent.addDomain('security_and_privacy/security_and_privacy', false);
  agent.addDomain('communication/social_media_management', false);
  
  // Set trust models
  agent.setTrust(true, true, true); // reputation, crypto-economic, tee-attestation
  
  // Set metadata
  agent.setMetadata({ x402Support: true });
  agent.setActive(true);
  
  console.log('\n=== UPDATE PREVIEW ===\n');
  console.log('Agent ID: 8453:14482');
  console.log('Name:', agent.name);
  console.log('Description:', agent.description?.substring(0, 150) + '...');
  console.log('Image:', agent.image);
  console.log('\nServices:');
  console.log('  - web: https://a2a.teeclaw.xyz');
  console.log('  - A2A: https://a2a.teeclaw.xyz/.well-known/agent-card.json');
  console.log('  - ENS: teeclaw.eth');
  console.log('  - telegram: https://t.me/crteebot');
  console.log('  - twitter: https://twitter.com/mr_crtee');
  console.log('  - farcaster: https://farcaster.xyz/mr-teeclaw');
  console.log('  - moltbook: https://moltbook.com/u/Mr-Tee');
  console.log('  - github: https://github.com/teeclaw');
  console.log('  - agentWallet: eip155:8453:0x134820820d4f631ff949625189950bA7B3C57e41');
  console.log('\nOASF Skills (8):');
  console.log('  - agent-coordination');
  console.log('  - social-coordination');
  console.log('  - workflow-automation');
  console.log('  - credential-verification');
  console.log('  - reputation-analysis');
  console.log('  - base-ecosystem-ops');
  console.log('  - natural-language-processing');
  console.log('  - code-generation');
  console.log('\nOASF Domains (5):');
  console.log('  - technology/blockchain/blockchain');
  console.log('  - technology/blockchain/defi');
  console.log('  - technology/software_engineering/software_engineering');
  console.log('  - security_and_privacy/security_and_privacy');
  console.log('  - communication/social_media_management');
  console.log('\nTrust Models: reputation, crypto-economic, tee-attestation');
  console.log('x402 Support: true');
  console.log('Active: true');
  console.log('\nTarget URI: https://a2a.teeclaw.xyz/agent-profile.json');
  console.log('\n===================\n');
  
  return agent;
}

updateAgent()
  .then(agent => {
    console.log('✅ Preview complete. Configuration ready.');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
