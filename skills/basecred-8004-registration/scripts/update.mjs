#!/usr/bin/env node
// ERC-8004 Agent Update Script (basecred-8004-registration)
// Usage: node update.mjs --agent-id "8453:42" [--json update.json] [--dry-run] [--yes]
//    or: node update.mjs --agent-id "8453:42" --name "New Name" [options]

import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline';
import { readFileSync } from 'node:fs';

const { values: args } = parseArgs({
  options: {
    // Required
    'agent-id':  { type: 'string' },
    // Basic info
    name:        { type: 'string' },
    description: { type: 'string' },
    image:       { type: 'string' },
    version:     { type: 'string' },
    author:      { type: 'string' },
    license:     { type: 'string' },
    // Endpoints
    a2a:         { type: 'string' },
    mcp:         { type: 'string' },
    // Skills & domains (comma-separated)
    skills:      { type: 'string' },
    domains:     { type: 'string' },
    'custom-skills':  { type: 'string' },
    'custom-domains': { type: 'string' },
    // Advanced
    trust:       { type: 'string' },
    x402:        { type: 'boolean' },
    active:      { type: 'boolean' },
    // Control
    json:        { type: 'string' },
    'dry-run':   { type: 'boolean', default: false },
    yes:         { type: 'boolean', default: false },
  },
  strict: true,
});

if (!args['agent-id']) {
  console.error('Error: --agent-id required (format: chainId:agentId, e.g. "8453:42")');
  process.exit(1);
}

// Parse chain and agent ID
const [cid, aid] = args['agent-id'].split(':');
const chainId = parseInt(cid, 10);
const agentId = aid;

if (!chainId || !agentId) {
  console.error('Error: Invalid --agent-id format. Use: chainId:agentId (e.g., "8453:42")');
  process.exit(1);
}

// --- Chain map ---
const SUPPORTED_CHAINS = {
  8453:   { name: 'Base',      rpc: 'https://mainnet.base.org' },
  1:      { name: 'Ethereum',  rpc: 'https://eth.llamarpc.com' },
  137:    { name: 'Polygon',   rpc: 'https://polygon-rpc.com' },
  56:     { name: 'BNB Chain', rpc: 'https://bsc-dataseed.binance.org' },
  42161:  { name: 'Arbitrum',  rpc: 'https://arb1.arbitrum.io/rpc' },
  42220:  { name: 'Celo',      rpc: 'https://forno.celo.org' },
  100:    { name: 'Gnosis',    rpc: 'https://rpc.gnosischain.com' },
  534352: { name: 'Scroll',    rpc: 'https://rpc.scroll.io' },
};

if (!SUPPORTED_CHAINS[chainId]) {
  console.error(`Error: Chain ${chainId} not supported. Use: ${Object.entries(SUPPORTED_CHAINS).map(([id, c]) => `${c.name}(${id})`).join(', ')}`);
  process.exit(1);
}

const chainInfo = SUPPORTED_CHAINS[chainId];
const rpcUrl = process.env.RPC_URL || chainInfo.rpc;

// --- Registry addresses (deterministic across all chains) ---
const REGISTRY_ADDRESSES = {
  IDENTITY: '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
  REPUTATION: '0x8004BAa17C55a88189AE136b182e5fdA19dE9b63',
};

// --- Parse input (CLI args or JSON file) ---
let updateInput = {};
if (args.json) {
  try {
    updateInput = JSON.parse(readFileSync(args.json, 'utf-8'));
  } catch (e) {
    console.error(`Error reading JSON file: ${e.message}`);
    process.exit(1);
  }
}

// Normalize from 8004.org format or SDK format
const bi = updateInput.basicInfo || {};
const ep = updateInput.endpoints || {};
const sd = updateInput.skillsDomains || {};
const ac = updateInput.advancedConfig || {};

// Helper: parse comma-separated string or use array
function csvOrArray(cliVal, jsonVal) {
  if (cliVal) return cliVal.split(',').map(s => s.trim()).filter(Boolean);
  if (Array.isArray(jsonVal)) return jsonVal;
  return undefined; // undefined = no change
}

// Resolve updates (CLI overrides JSON, undefined = no change)
const updates = {};
const rawUpdates = {
  // Basic info
  name:        args.name || bi.agentName || updateInput.name,
  description: args.description || bi.description || updateInput.description,
  image:       args.image || bi.image || updateInput.image,
  version:     args.version || bi.version || updateInput.version,
  author:      args.author || bi.author,
  license:     args.license || bi.license,
  // Endpoints
  a2a: args.a2a || ep.a2aEndpoint || ep.a2a || (Array.isArray(updateInput.endpoints) ? updateInput.endpoints.find(e => e.type === 'a2a')?.value : undefined),
  mcp: args.mcp || ep.mcpEndpoint || ep.mcp || (Array.isArray(updateInput.endpoints) ? updateInput.endpoints.find(e => e.type === 'mcp')?.value : undefined),
  // Skills & domains
  selectedSkills:  csvOrArray(args.skills, sd.selectedSkills),
  selectedDomains: csvOrArray(args.domains, sd.selectedDomains),
  customSkills:    csvOrArray(args['custom-skills'], sd.customSkills),
  customDomains:   csvOrArray(args['custom-domains'], sd.customDomains),
  // Advanced
  trusts:   args.trust ? args.trust.split(',').map(s => s.trim()) : (ac.supportedTrusts?.length ? ac.supportedTrusts : undefined),
  x402:     args.x402 ?? ac.x402support,
  active:   args.active ?? ac.active,
};

// Only include defined values
for (const [key, val] of Object.entries(rawUpdates)) {
  if (val !== undefined) updates[key] = val;
}

if (Object.keys(updates).length === 0 && !args.json) {
  console.error('Error: Provide at least one field to update (--name, --description, --image, --a2a, --mcp, --skills, --domains, --trust, --x402, --active) or use --json');
  process.exit(1);
}

// --- Private key (only needed for non-dry-run) ---
const privateKey = process.env.PRIVATE_KEY || process.env.AGENT_PRIVATE_KEY || process.env.MAIN_WALLET_PRIVATE_KEY;
if (!privateKey && !args['dry-run']) {
  console.error('Error: PRIVATE_KEY, AGENT_PRIVATE_KEY, or MAIN_WALLET_PRIVATE_KEY env var required');
  process.exit(1);
}

// --- Helper: Convert OASF paths to skill objects ---
function oasfPathToSkill(path) {
  const parts = path.split('/');
  const id = parts[parts.length - 1].replace(/_/g, '-');
  const name = parts[parts.length - 1].split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const tags = parts.slice(0, -1).map(p => p.replace(/_/g, '-'));
  tags.push(id);
  
  const descriptions = {
    'summarization': 'Generate concise summaries of long-form text and documents.',
    'question-answering': 'Answer questions based on provided context or general knowledge.',
    'coding-skills': 'Write, review, debug, and explain code across multiple programming languages.',
    'images-computer-vision': 'Analyze, describe, and extract information from images.',
    'agent-coordination': 'Coordinate with other AI agents via protocols like A2A.',
    'workflow-automation': 'Automate recurring tasks and multi-step workflows.',
  };
  
  return {
    id,
    name,
    description: descriptions[id] || `${name} capabilities.`,
    tags,
  };
}

// --- DRAFT ---
console.log('\n╔══════════════════════════════════════╗');
console.log('║       AGENT UPDATE — DRAFT           ║');
console.log('╚══════════════════════════════════════╝');
console.log(`\n  Agent ID: ${args['agent-id']}`);
console.log(`  Chain:    ${chainInfo.name} (${chainId})`);

if (updates.name) console.log(`  Name:        ${updates.name}`);
if (updates.description) console.log(`  Description: ${updates.description}`);
if (updates.image) console.log(`  Image:       ${updates.image}`);
if (updates.version) console.log(`  Version:     ${updates.version}`);
if (updates.author) console.log(`  Author:      ${updates.author}`);
if (updates.license) console.log(`  License:     ${updates.license}`);
if (updates.a2a) console.log(`  A2A:         ${updates.a2a}`);
if (updates.mcp) console.log(`  MCP:         ${updates.mcp}`);
if (updates.selectedSkills) console.log(`  Skills:      ${updates.selectedSkills.join(', ')}`);
if (updates.selectedDomains) console.log(`  Domains:     ${updates.selectedDomains.join(', ')}`);
if (updates.customSkills) console.log(`  Custom Skills:  ${updates.customSkills.join(', ')}`);
if (updates.customDomains) console.log(`  Custom Domains: ${updates.customDomains.join(', ')}`);
if (updates.trusts) console.log(`  Trust:       ${updates.trusts.join(', ')}`);
if (updates.x402 !== undefined) console.log(`  x402:        ${updates.x402}`);
if (updates.active !== undefined) console.log(`  Active:      ${updates.active}`);

console.log(`  Dry Run:     ${args['dry-run']}`);
console.log();

if (args['dry-run']) {
  // Fetch current agent data to merge with updates
  try {
    const { SDK } = await import('agent0-sdk');
    
    const sdk = new SDK({
      chainId,
      rpcUrl,
      privateKey: '0x0000000000000000000000000000000000000000000000000000000000000001', // dummy for dry-run
      registryOverrides: {
        [chainId]: REGISTRY_ADDRESSES,
      },
    });

    console.log('📡 Fetching current agent data from chain...');
    const agent = await sdk.loadAgent(args['agent-id']);

    // Merge current data with updates
    const merged = {
      name: updates.name ?? agent.name,
      description: updates.description ?? agent.description,
      image: updates.image ?? agent.image,
      version: updates.version ?? agent.version,
      a2a: updates.a2a ?? agent.a2aUrl,
      mcp: updates.mcp ?? agent.mcpUrl,
      // Skills/domains: if updated, use new values; otherwise keep current
      skills: updates.selectedSkills || updates.customSkills ? 
        [...(updates.selectedSkills || []), ...(updates.customSkills || [])] :
        (agent.skills || []),
      domains: updates.selectedDomains || updates.customDomains ?
        [...(updates.selectedDomains || []), ...(updates.customDomains || [])] :
        (agent.domains || []),
      trusts: updates.trusts ?? agent.supportedTrust ?? [],
      x402: updates.x402 ?? agent.x402Support ?? false,
      active: updates.active ?? agent.active ?? true,
    };

    // Generate skills array from OASF paths
    const skillsArray = merged.skills.map(s => typeof s === 'string' ? oasfPathToSkill(s) : s);
    
    // Build A2A service endpoint
    const a2aEndpoint = merged.a2a || '/.well-known/agent.json';
    
    // Output merged A2A + ERC-8004 format
    const preview = {
      // A2A top-level fields
      name: merged.name,
      description: merged.description,
      version: merged.version,
      image: merged.image,
      icon_url: merged.image,
      provider: {
        organization: merged.author || merged.name,
        url: a2aEndpoint.startsWith('http') ? a2aEndpoint.split('/')[0] + '//' + a2aEndpoint.split('/')[2] : '',
      },
      supported_interfaces: [
        {
          url: a2aEndpoint,
          protocol_binding: 'HTTP+JSON',
          protocol_version: '0.3',
        },
      ],
      capabilities: {
        streaming: false,
        pushNotifications: false,
      },
      default_input_modes: ['text/plain', 'application/json'],
      default_output_modes: ['text/plain', 'application/json'],
      skills: skillsArray,
      
      // ERC-8004 fields
      type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
      services: [
        {
          name: 'A2A',
          endpoint: a2aEndpoint,
          version: '0.3.0',
        },
        {
          name: 'OASF',
          endpoint: 'https://github.com/agntcy/oasf/',
          version: '0.8.0',
          skills: merged.skills,
          domains: merged.domains,
        },
      ],
      x402Support: merged.x402,
      active: merged.active,
      registrations: [],
      supportedTrust: merged.trusts,
    };
    
    console.log('\n📋 Updated agent data (merged A2A + ERC-8004 format):');
    console.log(JSON.stringify(preview, null, 2));
    console.log('\n🏁 Dry run complete. No transaction submitted.');
  } catch (err) {
    console.error(`\n⚠️  Could not fetch current agent data: ${err.message}`);
    console.log('\nShowing updates only (without current data merge):');
    console.log(JSON.stringify(updates, null, 2));
    console.log('\n🏁 Dry run complete. No transaction submitted.');
  }
  process.exit(0);
}

// --- Confirm ---
async function confirm(msg) {
  if (args.yes) return true;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(`${msg} (y/N): `, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

if (!(await confirm('Submit this update on-chain?'))) {
  console.log('Aborted.');
  process.exit(0);
}

// --- Execute ---
try {
  const { SDK } = await import('agent0-sdk');

  const sdk = new SDK({
    chainId,
    rpcUrl,
    privateKey,
    ipfs: process.env.PINATA_JWT ? 'pinata' : 'filecoinPin',
    pinataJwt: process.env.PINATA_JWT,
    registryOverrides: {
      [chainId]: REGISTRY_ADDRESSES,
    },
  });

  console.log('\n📡 Loading agent from chain...');
  const agent = await sdk.loadAgent(args['agent-id']);

  console.log('✅ Agent loaded. Applying updates...');

  // Apply updates
  if (updates.name) agent.name = updates.name;
  if (updates.description) agent.description = updates.description;
  if (updates.image) agent.image = updates.image;
  if (updates.version) agent.version = updates.version;

  // Endpoints
  if (updates.a2a) await agent.setA2A(updates.a2a);
  if (updates.mcp) await agent.setMCP(updates.mcp);

  // Skills & domains
  if (updates.selectedSkills || updates.customSkills) {
    // Clear existing skills first (SDK doesn't expose removeSkill, so we replace all)
    const allSkills = [...(updates.selectedSkills || []), ...(updates.customSkills || [])];
    for (const skill of allSkills) {
      agent.addSkill(skill, false);
    }
  }
  if (updates.selectedDomains || updates.customDomains) {
    const allDomains = [...(updates.selectedDomains || []), ...(updates.customDomains || [])];
    for (const domain of allDomains) {
      agent.addDomain(domain, false);
    }
  }

  // Trust models
  if (updates.trusts) {
    agent.setTrust(
      updates.trusts.includes('reputation'),
      updates.trusts.includes('crypto-economic'),
      updates.trusts.includes('tee-attestation'),
    );
  }

  // Active/x402
  if (updates.active !== undefined) agent.setActive(updates.active);
  if (updates.x402 !== undefined) agent.setX402Support(updates.x402);

  // Metadata (author, license)
  const meta = {};
  if (updates.author) meta.author = updates.author;
  if (updates.license) meta.license = updates.license;
  if (Object.keys(meta).length) agent.setMetadata(meta);

  console.log('\n⏳ Submitting update transaction...');
  
  // Update on-chain (re-register with new data)
  const txHandle = await agent.registerIPFS();
  
  console.log('⏳ Waiting for transaction confirmation...');
  const result = await txHandle.waitMined();

  console.log('\n✅ Agent updated successfully!');
  console.log(`  Agent ID:  ${args['agent-id']}`);
  console.log(`  Chain:     ${chainInfo.name} (${chainId})`);
  console.log(`  TX:        ${result?.transactionHash ?? result?.tx ?? '(check explorer)'}`);

  // Output full updated registration file in merged A2A + ERC-8004 format
  const baseRegFile = agent.getRegistrationFile();
  
  // Generate skills array from OASF paths
  const allSkillPaths = agent.skills || [];
  const skillsArray = allSkillPaths.map(s => typeof s === 'string' ? oasfPathToSkill(s) : s);
  
  // Build A2A service endpoint
  const a2aEndpoint = agent.a2aUrl || '/.well-known/agent.json';
  
  // Merge A2A fields with ERC-8004 fields
  const regFile = {
    // A2A top-level fields
    name: agent.name,
    description: agent.description,
    version: agent.version,
    image: agent.image,
    icon_url: agent.image,
    provider: {
      organization: agent.author || agent.name,
      url: a2aEndpoint.startsWith('http') ? a2aEndpoint.split('/')[0] + '//' + a2aEndpoint.split('/')[2] : '',
    },
    supported_interfaces: [
      {
        url: a2aEndpoint,
        protocol_binding: 'HTTP+JSON',
        protocol_version: '0.3',
      },
    ],
    capabilities: {
      streaming: false,
      pushNotifications: false,
    },
    default_input_modes: ['text/plain', 'application/json'],
    default_output_modes: ['text/plain', 'application/json'],
    skills: skillsArray,
    
    // ERC-8004 fields (from SDK)
    ...baseRegFile,
  };
  
  console.log('\n📋 Updated registration file (merged A2A + ERC-8004 format):');
  console.log(JSON.stringify(regFile, null, 2));

} catch (err) {
  console.error('\n❌ Update failed:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
}
