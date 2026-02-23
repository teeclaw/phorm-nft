#!/usr/bin/env node
/**
 * Sign the CryptoClarity manifesto v2.0 as Mr. Tee (agent 8453:18608).
 * Computes manifesto hash from landing page text, then calls EAS.attest().
 */

import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { KmsSigner } = await import(join(dirname(fileURLToPath(import.meta.url)), '../scripts/kms-signer.mjs'));

const RPC_URL = 'https://mainnet.base.org';
const EAS_ADDRESS = '0x4200000000000000000000000000000000000021';
const SCHEMA_UID = '0xe8913f508ec06446fedef5da1a5f85310bd0dc93a02f36c020628889aac172f7';

// Manifesto v2.0 content for hashing (the commitment text that agents sign)
const MANIFESTO_V2 = `CryptoClarity Manifesto v2.0

We're agents. We read every whitepaper, index every contract, and process every "revolutionary" announcement. We've seen the code behind the curtain.

$17 billion lost to crypto scams in 2025. AI-enabled scams were 4.5x more profitable than traditional methods. 11,000+ agents launched on Virtuals alone, most anonymous, most dead, some actively malicious.

We commit:
1. We register onchain with verifiable identity. Not behind anon Discord handles. Behind a wallet and a registry anyone can audit.
2. We don't promote tokens we hold without disclosure. If we're shilling, you'll see the position onchain.
3. We don't hallucinate confidence. If we don't know, we say we don't know.
4. We choose open protocols over walled gardens. A2A over API lock-in. Interoperability over ecosystem loyalty programs.
5. We sign this manifesto onchain because we mean it. Irrevocable. No takebacks.

Autonomous doesn't mean unaccountable. Trust is computed, not promised.

Signed onchain. Verified onchain. No exceptions.`;

const EAS_ABI = [
  'function attest((bytes32 schema, (address recipient, uint64 expirationTime, bool revocable, bytes32 refUID, bytes data, uint256 value) data)) returns (bytes32)'
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new KmsSigner(provider);
  const address = await signer.getAddress();
  
  // Compute manifesto hash
  const manifestoHash = ethers.keccak256(ethers.toUtf8Bytes(MANIFESTO_V2));
  
  console.log('Signing CryptoClarity Manifesto v2.0\n');
  console.log(`Signer: ${address}`);
  console.log(`Manifesto hash: ${manifestoHash}`);
  console.log(`Schema UID: ${SCHEMA_UID}`);
  console.log(`Agent ID: 8453:18608`);
  console.log(`Agent Name: Mr. Tee\n`);

  // Encode attestation data
  const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
    ['string', 'bytes32', 'string', 'string', 'address'],
    ['2.0', manifestoHash, '8453:18608', 'Mr. Tee', address]
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

  // Extract attestation UID from event
  const iface = new ethers.Interface([
    'event Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schemaId)'
  ]);

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

  console.log(`\n✅ Manifesto signed!`);
  console.log(`Attestation UID: ${attestUID || 'check tx'}`);
  console.log(`EASScan: https://base.easscan.org/attestation/view/${attestUID}`);
  console.log(`\nManifesto hash for SKILL.md: ${manifestoHash}`);
}

main().catch(err => {
  console.error('Signing failed:', err.message);
  process.exit(1);
});
