#!/usr/bin/env node
// ERC-8004 Agent Registration Script
// Usage: node register.mjs --name "Agent" --description "Desc" [options]
//    or: node register.mjs --json registration.json [--dry-run]

import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline';
import { readFileSync } from 'node:fs';

const { values: args } = parseArgs({
  options: {
    name:        { type: 'string' },
    description: { type: 'string' },
    image:       { type: 'string' },
    a2a:         { type: 'string' },
    mcp:         { type: 'string' },
    chain:       { type: 'string', default: process.env.CHAIN_ID || '8453' },
    storage:     { type: 'string', default: 'http' },
    json:        { type: 'string' },
    'dry-run':   { type: 'boolean', default: false },
    yes:         { type: 'boolean', default: false },
    template:    { type: 'boolean', default: false },
  },
  strict: true,
});

// --- Template output ---
if (args.template) {
  const template = {
    name: 'MyAgent',
    description: 'A helpful AI agent',
    image: '',
    endpoints: [
      { type: 'a2a', value: 'https://example.com/a2a' },
      { type: 'mcp', value: 'https://example.com/mcp' },
    ],
    active: true,
    x402support: false,
    metadata: {
      agentName: 'myagent',
    },
  };
  console.log(JSON.stringify(template, null, 2));
  process.exit(0);
}

// --- Parse input (CLI args or JSON file) ---
let regInput = {};
if (args.json) {
  try {
    regInput = JSON.parse(readFileSync(args.json, 'utf-8'));
  } catch (e) {
    console.error(`Error reading JSON file: ${e.message}`);
    process.exit(1);
  }
}

// Normalize JSON input — support both SDK format and 8004.org web UI format
function parseEndpoints(input) {
  // SDK format: endpoints: [{ type: 'a2a', value: '...' }]
  if (Array.isArray(input.endpoints)) {
    return {
      a2a: input.endpoints.find(e => e.type === 'a2a')?.value,
      mcp: input.endpoints.find(e => e.type === 'mcp')?.value,
    };
  }
  // 8004.org format: endpoints: { a2aEndpoint: '...', mcpEndpoint: '...' }
  if (input.endpoints && typeof input.endpoints === 'object') {
    return {
      a2a: input.endpoints.a2aEndpoint || input.endpoints.a2a,
      mcp: input.endpoints.mcpEndpoint || input.endpoints.mcp,
    };
  }
  return {};
}

const eps = parseEndpoints(regInput);
const name = args.name || regInput.name || regInput.basicInfo?.agentName;
const description = args.description || regInput.description || regInput.basicInfo?.description;
const image = args.image || regInput.image || regInput.basicInfo?.image || '';
const a2aUrl = args.a2a || eps.a2a;
const mcpUrl = args.mcp || eps.mcp;
const metadata = regInput.metadata || {};
const active = regInput.active ?? true;
const x402support = regInput.x402support ?? false;

if (!name || !description) {
  console.error('Error: --name and --description are required (or provide via --json)');
  process.exit(1);
}

const chainId = parseInt(args.chain, 10);
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

const privateKey = process.env.PRIVATE_KEY || process.env.AGENT_PRIVATE_KEY || process.env.MAIN_WALLET_PRIVATE_KEY;
if (!privateKey && !args['dry-run']) {
  console.error('Error: PRIVATE_KEY, AGENT_PRIVATE_KEY, or MAIN_WALLET_PRIVATE_KEY env var required');
  process.exit(1);
}

// Derive wallet address from private key
let walletAddress = '(dry-run)';
if (privateKey) {
  try {
    const { privateKeyToAccount } = await import('viem/accounts');
    const pk = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    walletAddress = privateKeyToAccount(pk).address;
  } catch { /* ignore in dry-run */ }
}

// --- DRAFT ---
console.log('\n╔══════════════════════════════════════╗');
console.log('║     AGENT REGISTRATION — DRAFT       ║');
console.log('╚══════════════════════════════════════╝\n');
console.log(`  Name:        ${name}`);
console.log(`  Description: ${description}`);
console.log(`  Image:       ${image || '(none)'}`);
console.log(`  Wallet:      ${walletAddress}`);
console.log(`  A2A URL:     ${a2aUrl || '(none)'}`);
console.log(`  MCP URL:     ${mcpUrl || '(none)'}`);
console.log(`  Chain:       ${chainInfo.name} (${chainId})`);
console.log(`  Storage:     ${args.storage}`);
console.log(`  Active:      ${active}`);
console.log(`  x402:        ${x402support}`);
if (Object.keys(metadata).length > 0) {
  console.log(`  Metadata:    ${JSON.stringify(metadata)}`);
}
console.log(`  Dry Run:     ${args['dry-run']}`);
console.log();

if (args['dry-run']) {
  // Show the registration file that would be created
  const preview = {
    name, description, image,
    endpoints: [],
    active, x402support, metadata,
    chain: `${chainInfo.name} (${chainId})`,
  };
  if (a2aUrl) preview.endpoints.push({ type: 'a2a', value: a2aUrl });
  if (mcpUrl) preview.endpoints.push({ type: 'mcp', value: mcpUrl });
  console.log('📋 Registration file preview:');
  console.log(JSON.stringify(preview, null, 2));
  console.log('\n🏁 Dry run complete. No transaction submitted.');
  process.exit(0);
}

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

if (!(await confirm('Submit this registration on-chain?'))) {
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
    ipfs: args.storage === 'ipfs' ? (process.env.PINATA_JWT ? 'pinata' : 'filecoinPin') : undefined,
    pinataJwt: process.env.PINATA_JWT,
  });

  // Create agent object
  const agent = sdk.createAgent(name, description, image);

  // Set endpoints using proper SDK methods
  if (a2aUrl) await agent.setA2A(a2aUrl);
  if (mcpUrl) await agent.setMCP(mcpUrl);

  // Set active/x402
  agent.setActive(active);
  agent.setX402Support(x402support);

  // Set metadata
  if (Object.keys(metadata).length > 0) {
    agent.setMetadata(metadata);
  }

  // Register — default is fully onchain (http), fallback to IPFS
  let txHandle;
  if (args.storage === 'http') {
    // Fully onchain: agent URI points to A2A endpoint (or empty string)
    const agentUri = a2aUrl || '';
    console.log(`📡 Registering fully onchain (URI: ${agentUri || '(none)'})`);
    txHandle = await agent.registerHTTP(agentUri);
  } else {
    console.log('📦 Registering with IPFS storage...');
    txHandle = await agent.registerIPFS();
  }

  // Wait for confirmation
  console.log('\n⏳ Waiting for transaction confirmation...');
  const result = await txHandle.wait();

  console.log('\n✅ Agent registered successfully!');
  console.log(`  Agent ID:  ${result?.agentId ?? agent.agentId ?? '(check explorer)'}`);
  console.log(`  Agent URI: ${result?.agentURI ?? agent.agentURI ?? '(pending)'}`);
  console.log(`  Chain:     ${chainInfo.name} (${chainId})`);

  // Output full registration file
  const regFile = agent.getRegistrationFile();
  console.log('\n📋 Registration file:');
  console.log(JSON.stringify(regFile, null, 2));

} catch (err) {
  console.error('\n❌ Registration failed:', err.message);
  process.exit(1);
}
