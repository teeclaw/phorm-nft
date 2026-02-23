/**
 * Sign the CryptoClarity Manifesto v3 via EAS attestation
 * Mr. Tee - ERC-8004 verified agent (free, no USDC needed)
 */
import { ethers } from 'ethers';
import { KmsSigner } from '../../scripts/kms-signer.mjs';

const EAS = '0x4200000000000000000000000000000000000021';
const SCHEMA_UID = '0x79a16f5428f2ff113869491fc9c90e0109b0150e2d4b89f47e3e21aeccbc26dc';

// Manifesto data
const MANIFESTO_VERSION = '2.0';
const MANIFESTO_HASH = '0x5d33582090e5ed1a5f2c4dac2706d8c322f6a64cb9ff815c76fc5f9bcd96d702';
const AGENT_NAME = 'Mr. Tee';
const AGENT_DESCRIPTION = 'AI agent with a CRT monitor for a head. Base ecosystem, A2A protocol, reputation infrastructure.';

// ERC-8004 registry info (for verified badge)
const REGISTRY_ADDRESS = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';
const REGISTRY_AGENT_ID = 18608;

const EAS_ABI = [
  'function attest((bytes32 schema, (address recipient, uint64 expirationTime, bool revocable, bytes32 refUID, bytes data, uint256 value) data)) external payable returns (bytes32)',
  'event Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schemaUID)',
];

async function main() {
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const signer = new KmsSigner(provider);
  const attester = await signer.getAddress();

  console.log('=== CryptoClarity Manifesto v3 Signing ===');
  console.log('Attester:', attester);
  console.log('Agent:', AGENT_NAME);
  console.log('Description:', AGENT_DESCRIPTION);
  console.log('Registry:', REGISTRY_ADDRESS);
  console.log('Agent ID:', REGISTRY_AGENT_ID);
  console.log('Schema UID:', SCHEMA_UID);
  console.log('Manifesto version:', MANIFESTO_VERSION);
  console.log('Manifesto hash:', MANIFESTO_HASH);

  // Encode attestation data matching schema:
  // string manifestoVersion, bytes32 manifestoHash, string agentName,
  // string agentDescription, address registryAddress, uint256 registryAgentId
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();
  const encodedData = abiCoder.encode(
    ['string', 'bytes32', 'string', 'string', 'address', 'uint256'],
    [MANIFESTO_VERSION, MANIFESTO_HASH, AGENT_NAME, AGENT_DESCRIPTION, REGISTRY_ADDRESS, REGISTRY_AGENT_ID]
  );

  const eas = new ethers.Contract(EAS, EAS_ABI, signer);

  const attestationRequest = {
    schema: SCHEMA_UID,
    data: {
      recipient: ethers.ZeroAddress,
      expirationTime: 0n,
      revocable: false,
      refUID: ethers.ZeroHash,
      data: encodedData,
      value: 0n,
    },
  };

  if (process.argv.includes('--dry-run')) {
    const gas = await eas.attest.estimateGas(attestationRequest);
    const feeData = await provider.getFeeData();
    const cost = gas * (feeData.gasPrice || 0n);
    console.log('\n--- DRY RUN ---');
    console.log('Estimated gas:', gas.toString());
    console.log('Estimated cost:', ethers.formatEther(cost), 'ETH');
    console.log('--- END DRY RUN ---');
    return;
  }

  console.log('\nSigning manifesto...');
  const tx = await eas.attest(attestationRequest);
  console.log('Tx:', tx.hash);
  console.log('Waiting for confirmation...');

  const receipt = await tx.wait();
  console.log('Confirmed in block:', receipt.blockNumber);

  for (const log of receipt.logs) {
    try {
      const parsed = eas.interface.parseLog(log);
      if (parsed?.name === 'Attested') {
        const uid = parsed.args[2];
        console.log('\n✅ Manifesto signed!');
        console.log('Attestation UID:', uid);
        console.log('EASScan:', `https://base.easscan.org/attestation/view/${uid}`);
      }
    } catch {}
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
