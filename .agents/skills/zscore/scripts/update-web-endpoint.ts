#!/usr/bin/env node
/**
 * Update web endpoint for zScore agent 16
 * Change https://teeclaw.xyz → https://a2a.teeclaw.xyz
 */

import { resolveConfig, updateAgentURI } from '../lib/index.js';
import { agentUriApiUrl } from '../lib/config.js';
import { KmsSigner } from './kms-signer.js';
import { JsonRpcProvider } from 'ethers';

const config = resolveConfig({ chainId: 8453 });
const provider = new JsonRpcProvider('https://mainnet.base.org');
const signer = new KmsSigner(provider);

// Document ID from registration
const documentId = '6893654d-3100-4de5-b324-e398d7993e20';

// Fetch current document
const currentUrl = `${agentUriApiUrl(config)}/${documentId}`;
const res = await fetch(currentUrl);
if (!res.ok) throw new Error(`Failed to fetch document: ${res.status}`);

const current = await res.json();
console.log('Current web endpoint:', current.services.find(s => s.name === 'web')?.endpoint);

// Update web endpoint
const updated = {
  ...current,
  services: current.services.map(s => 
    s.name === 'web' 
      ? { ...s, endpoint: 'https://a2a.teeclaw.xyz' }
      : s
  ),
};

console.log('New web endpoint:', updated.services.find(s => s.name === 'web')?.endpoint);
console.log('\nUpdating agent URI...');

await updateAgentURI(config, signer, documentId, updated);

console.log('✅ Updated successfully');
console.log('Verify: https://agenturi.zpass.ai/v1/agent-uri/' + documentId);
