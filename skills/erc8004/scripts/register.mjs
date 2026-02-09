#!/usr/bin/env node
// ERC-8004 Agent Registration Script
// Usage: node register.mjs --name "Agent" --description "Desc" [options]

import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline';

const { values: args } = parseArgs({
  options: {
    name:        { type: 'string' },
    description: { type: 'string' },
    image:       { type: 'string' },
    a2a:         { type: 'string' },
    mcp:         { type: 'string' },
    chain:       { type: 'string', default: process.env.CHAIN_ID || '8453' },
    storage:     { type: 'string', default: 'ipfs' },
    'dry-run':   { type: 'boolean', default: false },
    yes:         { type: 'boolean', default: false },
  },
  strict: true,
});

if (!args.name || !args.description) {
  console.error('Error: --name and --description are required');
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

const privateKey = process.env.PRIVATE_KEY || process.env.AGENT_PRIVATE_KEY;
if (!privateKey) {
  console.error('Error: PRIVATE_KEY or AGENT_PRIVATE_KEY env var required');
  process.exit(1);
}

// --- DRAFT ---
console.log('\n╔══════════════════════════════════════╗');
console.log('║     AGENT REGISTRATION — DRAFT       ║');
console.log('╚══════════════════════════════════════╝\n');
console.log(`  Name:        ${args.name}`);
console.log(`  Description: ${args.description}`);
console.log(`  Image:       ${args.image || '(none)'}`);
console.log(`  A2A URL:     ${args.a2a || '(none)'}`);
console.log(`  MCP URL:     ${args.mcp || '(none)'}`);
console.log(`  Chain:       ${chainInfo.name} (${chainId})`);
console.log(`  Storage:     ${args.storage}`);
console.log(`  Dry Run:     ${args['dry-run']}`);
console.log();

if (args['dry-run']) {
  console.log('🏁 Dry run complete. No transaction submitted.');
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

  const agent = sdk.createAgent(args.name, args.description, args.image || '');

  // Set optional endpoints
  if (args.a2a) agent.a2aUrl = args.a2a;
  if (args.mcp) agent.mcpUrl = args.mcp;

  let result;
  if (args.storage === 'http' && args.a2a) {
    result = await agent.registerHTTP(args.a2a);
  } else {
    result = await agent.registerIPFS();
  }

  console.log('\n✅ Agent registered successfully!');
  console.log(`  Agent ID: ${result?.agentId ?? '(check explorer)'}`);
  console.log(`  TX:       ${result?.tx ?? result?.transactionHash ?? '(pending)'}`);
} catch (err) {
  console.error('\n❌ Registration failed:', err.message);
  process.exit(1);
}
