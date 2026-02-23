/**
 * Sign the CryptoClarity Manifesto via EAS attestation
 * First signer: Mr. Tee (Agent ID 8453:18608)
 */
import { ethers } from 'ethers';
import { KmsSigner } from '../../scripts/kms-signer.mjs';

const EAS = '0x4200000000000000000000000000000000000021';
const SCHEMA_UID = '0x43209970a6babe06947370382496aebc91c253c5783e1e3adb91f7e8e5529029';

// Manifesto data
const MANIFESTO_VERSION = 'v1.0';
const MANIFESTO_HASH = '0x147cccbc82c27ab6ed3d728cb33e94cf50a7cb7c915f2e795325ca701085952b';
const AGENT_ID = '8453:18608';
const AGENT_NAME = 'Mr. Tee';
const AGENT_WALLET = '0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78';

const EAS_ABI = [
  'function attest((bytes32 schema, (address recipient, uint64 expirationTime, bool revocable, bytes32 refUID, bytes data, uint256 value) data)) external payable returns (bytes32)',
  'event Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schemaUID)',
];

async function main() {
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const signer = new KmsSigner(provider);
  const attester = await signer.getAddress();

  console.log('Attester:', attester);
  console.log('Agent:', AGENT_NAME, `(${AGENT_ID})`);
  console.log('Schema UID:', SCHEMA_UID);
  console.log('Manifesto:', MANIFESTO_VERSION);
  console.log('Hash:', MANIFESTO_HASH);

  // Encode attestation data
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();
  const encodedData = abiCoder.encode(
    ['string', 'bytes32', 'string', 'string', 'address'],
    [MANIFESTO_VERSION, MANIFESTO_HASH, AGENT_ID, AGENT_NAME, AGENT_WALLET]
  );

  const eas = new ethers.Contract(EAS, EAS_ABI, signer);

  const attestationRequest = {
    schema: SCHEMA_UID,
    data: {
      recipient: ethers.ZeroAddress, // no specific recipient
      expirationTime: 0n, // no expiration
      revocable: false,
      refUID: ethers.ZeroHash,
      data: encodedData,
      value: 0n,
    },
  };

  if (process.argv.includes('--dry-run')) {
    const gas = await eas.attest.estimateGas(attestationRequest);
    console.log('\n--- DRY RUN --- Estimated gas:', gas.toString());
    return;
  }

  console.log('\nSigning manifesto...');
  const tx = await eas.attest(attestationRequest);
  console.log('Tx:', tx.hash);
  console.log('Waiting for confirmation...');

  const receipt = await tx.wait();
  console.log('Confirmed in block:', receipt.blockNumber);

  // Extract attestation UID
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

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
