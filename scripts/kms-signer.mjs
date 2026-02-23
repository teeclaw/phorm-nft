/**
 * GCP KMS Signer for ethers.js v6
 * Signs Ethereum transactions using GCP Cloud KMS (key never leaves HSM)
 *
 * Key: projects/gen-lang-client-0700091131/locations/global/keyRings/mr-tee-keyring/cryptoKeys/agent-wallet/cryptoKeyVersions/1
 * Algorithm: EC_SIGN_SECP256K1_SHA256
 * Address: 0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78
 */

import { ethers } from 'ethers';
import { createHash } from 'crypto';

const KMS_KEY_VERSION =
  'projects/gen-lang-client-0700091131/locations/global/keyRings/mr-tee-keyring/cryptoKeys/agent-wallet/cryptoKeyVersions/1';
const KMS_ADDRESS = '0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78';
const METADATA_TOKEN_URL =
  'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token';

/** Fetch GCP access token from metadata server */
async function getGcpToken() {
  const res = await fetch(METADATA_TOKEN_URL, {
    headers: { 'Metadata-Flavor': 'Google' },
  });
  const { access_token } = await res.json();
  return access_token;
}

/**
 * Parse DER-encoded ECDSA signature → { r, s } as BigInt
 * GCP KMS returns signatures in DER format (SEQUENCE { INTEGER r, INTEGER s })
 */
function parseDerSignature(der) {
  // DER structure: 30 len 02 rLen r... 02 sLen s...
  let offset = 0;
  if (der[offset++] !== 0x30) throw new Error('Invalid DER: expected SEQUENCE');
  const totalLen = der[offset++];
  if (der[offset++] !== 0x02) throw new Error('Invalid DER: expected INTEGER for r');
  const rLen = der[offset++];
  const rBytes = der.slice(offset, offset + rLen);
  offset += rLen;
  if (der[offset++] !== 0x02) throw new Error('Invalid DER: expected INTEGER for s');
  const sLen = der[offset++];
  const sBytes = der.slice(offset, offset + sLen);

  // DER INTEGERs may have leading 0x00 to indicate positive; strip it
  const r = BigInt('0x' + Buffer.from(rBytes).toString('hex').replace(/^00/, ''));
  let s = BigInt('0x' + Buffer.from(sBytes).toString('hex').replace(/^00/, ''));

  // Ensure low-S (EIP-2)
  const SECP256K1_ORDER = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
  if (s > SECP256K1_ORDER / 2n) {
    s = SECP256K1_ORDER - s;
  }

  return { r, s };
}

/**
 * Recover Ethereum v value by trying v=27 and v=28
 * Returns the full 65-byte signature { r, s, v }
 */
function recoverV(digest, r, s, expectedAddress) {
  const rHex = r.toString(16).padStart(64, '0');
  const sHex = s.toString(16).padStart(64, '0');

  for (const v of [27, 28]) {
    const sig = '0x' + rHex + sHex + v.toString(16).padStart(2, '0');
    try {
      const recovered = ethers.recoverAddress('0x' + Buffer.from(digest).toString('hex'), sig);
      if (recovered.toLowerCase() === expectedAddress.toLowerCase()) {
        return { r: '0x' + rHex, s: '0x' + sHex, v };
      }
    } catch (_) {}
  }
  throw new Error('Could not recover v — address mismatch');
}

/**
 * Sign a 32-byte digest using GCP KMS
 * Returns a full 65-byte Ethereum signature
 */
export async function kmsSign(digest) {
  const token = await getGcpToken();

  // KMS expects the digest as a base64-encoded SHA-256 hash
  // For secp256k1 with EC_SIGN_SECP256K1_SHA256, we send the raw 32-byte keccak digest
  // KMS will NOT re-hash it — it signs the raw digest directly when using asymmetric secp256k1
  const digestB64 = Buffer.from(digest).toString('base64');

  const url = `https://cloudkms.googleapis.com/v1/${KMS_KEY_VERSION}:asymmetricSign`;
  const body = JSON.stringify({
    digest: { sha256: digestB64 },
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`KMS sign failed: ${res.status} ${err}`);
  }

  const { signature: sigB64 } = await res.json();
  const der = Buffer.from(sigB64, 'base64');

  const { r, s } = parseDerSignature(der);
  return recoverV(digest, r, s, KMS_ADDRESS);
}

/**
 * ethers.js v6 compatible KMS Signer
 * Usage: const signer = new KmsSigner(provider);
 */
export class KmsSigner extends ethers.AbstractSigner {
  constructor(provider = null) {
    super(provider);
    this.address = KMS_ADDRESS;
  }

  async getAddress() {
    return this.address;
  }

  async signDigest(digest) {
    const { r, s, v } = await kmsSign(
      typeof digest === 'string' ? Buffer.from(digest.slice(2), 'hex') : digest
    );
    return ethers.Signature.from({ r, s, v });
  }

  async signMessage(message) {
    const msgBytes =
      typeof message === 'string' ? ethers.toUtf8Bytes(message) : message;
    const prefix = ethers.toUtf8Bytes(`\x19Ethereum Signed Message:\n${msgBytes.length}`);
    const combined = new Uint8Array(prefix.length + msgBytes.length);
    combined.set(prefix);
    combined.set(msgBytes, prefix.length);
    const digest = ethers.getBytes(ethers.keccak256(combined));
    const sig = await this.signDigest(digest);
    return sig.serialized;
  }

  async signTransaction(tx) {
    const populated = await this.populateTransaction(tx);
    delete populated.from;
    const unsignedTx = ethers.Transaction.from(populated);
    const digest = ethers.getBytes(unsignedTx.unsignedHash);
    const sig = await this.signDigest(digest);
    unsignedTx.signature = sig;
    return unsignedTx.serialized;
  }

  async signTypedData(domain, types, value) {
    const digest = ethers.getBytes(
      ethers.TypedDataEncoder.hash(domain, types, value)
    );
    const sig = await this.signDigest(digest);
    return sig.serialized;
  }

  connect(provider) {
    return new KmsSigner(provider);
  }
}

/** Quick test: sign a known message and verify address recovery */
export async function testKmsSigner() {
  console.log('Testing KMS signer...');
  console.log('KMS address:', KMS_ADDRESS);

  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const signer = new KmsSigner(provider);

  const addr = await signer.getAddress();
  console.log('Signer address:', addr);

  const msg = 'Mr. Tee KMS test';
  const sig = await signer.signMessage(msg);
  const recovered = ethers.verifyMessage(msg, sig);
  console.log('Signature:', sig.slice(0, 20) + '...');
  console.log('Recovered:', recovered);
  console.log('Match:', recovered.toLowerCase() === KMS_ADDRESS.toLowerCase() ? '✅' : '❌');
}
