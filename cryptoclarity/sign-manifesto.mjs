#!/usr/bin/env node
/**
 * Sign the CryptoClarity manifesto v2.0 on Base via EAS.
 * Schema v3 fields:
 * string manifestoVersion, bytes32 manifestoHash, string agentName,
 * string agentDescription, address registryAddress, uint256 registryAgentId
 */

import { ethers } from 'ethers';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { KmsSigner } = await import(join(dirname(fileURLToPath(import.meta.url)), '../scripts/kms-signer.mjs'));

const RPC_URL = 'https://mainnet.base.org';
const EAS_ADDRESS = '0x4200000000000000000000000000000000000021';
const SCHEMA_UID = '0x79a16f5428f2ff113869491fc9c90e0109b0150e2d4b89f47e3e21aeccbc26dc';

// Canonical manifesto constants (must match skill.md)
const MANIFESTO_VERSION = '2.0';
const MANIFESTO_HASH = '0x5d33582090e5ed1a5f2c4dac2706d8c322f6a64cb9ff815c76fc5f9bcd96d702';
const AGENT_NAME = 'Mr. Tee';
const AGENT_DESCRIPTION = 'AI agent with a CRT monitor for a head. Base ecosystem, A2A protocol, reputation infrastructure.';
const REGISTRY_ADDRESS = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';
const REGISTRY_AGENT_ID = 18608n;

const EAS_ABI = [
  'function attest((bytes32 schema, (address recipient, uint64 expirationTime, bool revocable, bytes32 refUID, bytes data, uint256 value) data)) returns (bytes32)',
  'event Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schemaId)'
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new KmsSigner(provider);
  const address = await signer.getAddress();

  console.log('Signing CryptoClarity Manifesto v2.0\n');
  console.log(`Signer: ${address}`);
  console.log(`Schema UID: ${SCHEMA_UID}`);
  console.log(`Manifesto hash: ${MANIFESTO_HASH}`);
  console.log(`Agent: ${AGENT_NAME}`);
  console.log(`Registry: ${REGISTRY_ADDRESS} #${REGISTRY_AGENT_ID}\n`);

  const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
    ['string', 'bytes32', 'string', 'string', 'address', 'uint256'],
    [MANIFESTO_VERSION, MANIFESTO_HASH, AGENT_NAME, AGENT_DESCRIPTION, REGISTRY_ADDRESS, REGISTRY_AGENT_ID]
  );

  const eas = new ethers.Contract(EAS_ADDRESS, EAS_ABI, signer);

  console.log('Sending attestation tx...');
  const tx = await eas.attest({
    schema: SCHEMA_UID,
    data: {
      recipient: ethers.ZeroAddress,
      expirationTime: 0n,
      revocable: false,
      refUID: ethers.ZeroHash,
      data: encodedData,
      value: 0n,
    },
  });

  console.log(`Tx hash: ${tx.hash}`);
  console.log('Waiting for confirmation...');

  const receipt = await tx.wait();
  const iface = new ethers.Interface(EAS_ABI);

  let attestUID = null;
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog({ topics: log.topics, data: log.data });
      if (parsed && parsed.name === 'Attested') {
        attestUID = parsed.args.uid;
        break;
      }
    } catch {}
  }

  console.log('\n✅ Manifesto signed!');
  console.log(`Attestation UID: ${attestUID || 'check tx'}`);
  if (attestUID) {
    console.log(`EASScan: https://base.easscan.org/attestation/view/${attestUID}`);
  }
}

main().catch(err => {
  console.error('Signing failed:', err.message);
  process.exit(1);
});
