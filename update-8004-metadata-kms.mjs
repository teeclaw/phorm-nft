#!/usr/bin/env node

/**
 * Update ERC-8004 agent URI using KMS signer
 * Spec: setAgentURI(uint256 agentId, string newURI)
 */

import { ethers } from 'ethers';
import { KmsSigner } from './scripts/kms-signer.mjs';
import fs from 'fs';

const IDENTITY_REGISTRY = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';

const ABI = [
  {
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "newURI", type: "string" }
    ],
    name: "setAgentURI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
];

async function updateMetadata() {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
      console.error('Usage: node update-8004-metadata-kms.mjs <agent-id> <json-file>');
      process.exit(1);
    }

    const agentId = args[0];
    const jsonFile = args[1];

    // Read and validate JSON
    const parsed = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));

    // Set up provider and KMS signer
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    const signer = new KmsSigner(provider);
    const address = await signer.getAddress();

    console.log('🔓 Using KMS signer:', address);

    // Verify ownership
    const contract = new ethers.Contract(IDENTITY_REGISTRY, ABI, provider);
    const owner = await contract.ownerOf(agentId);
    
    if (owner.toLowerCase() !== address.toLowerCase()) {
      throw new Error(`Not owner. Owner: ${owner}, Signer: ${address}`);
    }

    // Encode as on-chain data URI
    const newURI = `data:application/json;base64,${Buffer.from(JSON.stringify(parsed)).toString('base64')}`;

    console.log(`Updating Agent ${agentId}...`);
    console.log(`URI length: ${newURI.length} bytes`);

    const contractWithSigner = contract.connect(signer);
    const tx = await contractWithSigner.setAgentURI(agentId, newURI);

    console.log(`✅ Tx submitted: ${tx.hash}`);
    console.log('⏳ Waiting for confirmation...');

    const receipt = await tx.wait();
    console.log(`✅ Confirmed in block ${receipt.blockNumber}`);
    console.log(`https://basescan.org/tx/${tx.hash}`);

  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }
}

updateMetadata();
