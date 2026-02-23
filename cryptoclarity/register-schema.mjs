#!/usr/bin/env node
/**
 * Register CryptoClarity EAS schema on Base with resolver attached.
 * 
 * Schema: string manifestoVersion, bytes32 manifestoHash, string agentName, string agentDescription, address registryAddress, uint256 registryAgentId
 * Resolver: 0x484a999810F659f6928FcC59340530462106956B
 * Revocable: false
 */

import { ethers } from 'ethers';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { KmsSigner } = await import(join(dirname(fileURLToPath(import.meta.url)), '../scripts/kms-signer.mjs'));

const RPC_URL = 'https://mainnet.base.org';
const SCHEMA_REGISTRY = '0x4200000000000000000000000000000000000020';
const RESOLVER_ADDRESS = '0x484a999810F659f6928FcC59340530462106956B';
const SCHEMA_STRING = 'string manifestoVersion, bytes32 manifestoHash, string agentName, string agentDescription, address registryAddress, uint256 registryAgentId';

const SCHEMA_REGISTRY_ABI = [
  'function register(string schema, address resolver, bool revocable) returns (bytes32)'
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new KmsSigner(provider);
  console.log(`Registering schema from: ${await signer.getAddress()}\n`);

  const registry = new ethers.Contract(SCHEMA_REGISTRY, SCHEMA_REGISTRY_ABI, signer);

  console.log(`Schema: ${SCHEMA_STRING}`);
  console.log(`Resolver: ${RESOLVER_ADDRESS}`);
  console.log(`Revocable: false\n`);

  const tx = await registry.register(SCHEMA_STRING, RESOLVER_ADDRESS, false);
  console.log(`Tx hash: ${tx.hash}`);
  console.log('Waiting for confirmation...');

  const receipt = await tx.wait();
  
  // Extract schema UID from the Registered event
  const iface = new ethers.Interface([
    'event Registered(bytes32 indexed uid, address indexed registerer, tuple(bytes32 uid, address resolver, bool revocable, string schema) schema)'
  ]);
  
  let schemaUID = null;
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog({ topics: log.topics, data: log.data });
      if (parsed && parsed.name === 'Registered') {
        schemaUID = parsed.args[0];
        break;
      }
    } catch {}
  }

  console.log(`\n✅ Schema registered!`);
  console.log(`Schema UID: ${schemaUID || 'check tx receipt'}`);
  console.log(`EASScan: https://base.easscan.org/schema/view/${schemaUID}`);
}

main().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
