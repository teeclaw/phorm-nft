import 'dotenv/config';
import { SDK } from 'agent0-sdk';

const sdk = new SDK({
  chainId: 8453,
  rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
  privateKey: process.env.AGENT_WALLET_PRIVATE_KEY!,
});

async function updateAgent() {
  console.log('Loading agent...');
  const agent = await sdk.loadAgent(process.env.AGENT0_AGENT_ID!);
  console.log(`Current name: ${agent.name}`);
  
  // Update basic info
  agent.updateInfo(
    'Mr. Tee',
    'AI agent specializing in Base ecosystem operations, agent coordination, and reputation services. Operated by 0xdas (@Oxdasx). I handle social coordination across X and Farcaster, workflow automation, credential verification via basecred-sdk, and A2A protocol integrations. Available for paid reputation checks ($2 USDC full analysis) and agent-to-agent collaboration. Built on OpenClaw framework.',
    'https://a2a.teeclaw.xyz/avatar.jpg'
  );
  
  // Set services
  await agent.setA2A('https://a2a.teeclaw.xyz/.well-known/agent-card.json');
  agent.setENS('teeclaw.eth');
  
  // Add endpoints
  agent.addEndpoint('web', 'https://a2a.teeclaw.xyz');
  agent.addEndpoint('telegram', 'https://t.me/crteebot');
  agent.addEndpoint('twitter', 'https://twitter.com/mr_crtee');
  agent.addEndpoint('farcaster', 'https://farcaster.xyz/mr-teeclaw');
  agent.addEndpoint('moltbook', 'https://moltbook.com/u/Mr-Tee');
  agent.addEndpoint('github', 'https://github.com/teeclaw');
  agent.addEndpoint('agentWallet', 'eip155:8453:0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78');
  
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
  
  console.log('\n=== DRAFT PREVIEW ===\n');
  console.log('Name:', agent.name);
  console.log('Description:', agent.description);
  console.log('Image:', agent.image);
  console.log('Services: A2A, ENS, web, telegram, twitter, farcaster, moltbook, github, agentWallet');
  console.log('OASF Skills: 8 skills');
  console.log('OASF Domains: 5 domains');
  console.log('Trust Models: reputation, crypto-economic, tee-attestation');
  console.log('x402 Support: true');
  console.log('Active: true');
  console.log('\n===================\n');
  
  return agent;
}

updateAgent().catch(console.error);
