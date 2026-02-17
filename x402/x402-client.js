/**
 * x402-client.js — Outgoing payment client
 * Makes x402-protected HTTP calls automatically using viem + onchain.fi
 *
 * Usage:
 *   const { x402Fetch, createX402Client } = require('./x402-client');
 *
 *   // One-shot fetch (auto-pays on 402):
 *   const res = await x402Fetch('https://agent.example.com/paid-endpoint', {
 *     method: 'POST',
 *     body: JSON.stringify({ message: 'hello' }),
 *   });
 *
 *   // Client with persistent config:
 *   const client = createX402Client({
 *     privateKey: '0x...',   // or leave blank to use GPG-decrypted key
 *     network: 'base',
 *   });
 *   const res = await client.fetch('https://...', { method: 'POST', ... });
 */

'use strict';

const https = require('https');
const http = require('http');
const { execSync } = require('child_process');
const { createWalletClient, createPublicClient, http: viemHttp, parseUnits, encodeFunctionData } = require('viem');
const { base } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');

// ─── Constants ────────────────────────────────────────────────────────────────

const ONCHAIN_API = 'api.onchain.fi';

// onchain.fi intermediate addresses (sign TO these, not to the endpoint owner)
const INTERMEDIATE = {
  'base':    '0xfeb1F8F7F9ff37B94D14c88DE9282DA56b3B1Cb1',
  'solana':  'DoVABZK8r9793SuR3powWCTdr2wVqwhueV9DuZu97n2L',
};

// USDC on Base (ERC-3009 compatible)
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// EIP-3009 transferWithAuthorization ABI (for signing)
const EIP3009_ABI = [
  {
    name: 'transferWithAuthorization',
    type: 'function',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
      { name: 'v', type: 'uint8' },
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
];

// EIP-712 domain + type for EIP-3009
const EIP3009_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
};

// ─── Key management ───────────────────────────────────────────────────────────

/**
 * Decrypt private key from GPG secrets.
 * Falls back to AGENT_WALLET_PRIVATE_KEY env var if set.
 */
function getPrivateKey(overrideKey) {
  if (overrideKey) return overrideKey;

  const envKey = process.env.AGENT_WALLET_PRIVATE_KEY;
  // Skip GPG placeholder pattern (e.g. "GPG:AGENT_WALLET_PRIVATE_KEY")
  if (envKey && !envKey.startsWith('GPG:')) {
    let k = envKey.trim();
    if (!k.startsWith('0x')) k = `0x${k}`;
    return k;
  }

  // Decrypt from GPG
  const passphrase = process.env.OPENCLAW_GPG_PASSPHRASE;
  if (!passphrase) throw new Error('OPENCLAW_GPG_PASSPHRASE not set — cannot decrypt private key');

  const secretsFile = `${process.env.HOME}/.openclaw/.env.secrets.gpg`;
  const json = execSync(
    `gpg --batch --decrypt --passphrase "${passphrase}" "${secretsFile}" 2>/dev/null`,
    { encoding: 'utf8' }
  );
  const secrets = JSON.parse(json.trim());
  if (!secrets.AGENT_WALLET_PRIVATE_KEY) throw new Error('AGENT_WALLET_PRIVATE_KEY not found in GPG secrets');
  // Ensure 0x prefix and trimmed
  let pk = secrets.AGENT_WALLET_PRIVATE_KEY.trim();
  if (!pk.startsWith('0x')) pk = `0x${pk}`;
  return pk;
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

function httpRequest(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;
    const payload = body ? JSON.stringify(body) : null;

    const opts = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...options.headers,
      },
    };

    const req = lib.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        let parsed_body;
        try { parsed_body = JSON.parse(data); } catch { parsed_body = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed_body, raw: data });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function onchainPost(path, body) {
  return httpRequest(`https://${ONCHAIN_API}${path}`, {
    method: 'POST',
    headers: { 'X-API-Key': process.env.ONCHAIN_API_KEY },
  }, body);
}

// ─── EIP-3009 signing ─────────────────────────────────────────────────────────

/**
 * Sign an EIP-3009 TransferWithAuthorization for USDC on Base.
 * Returns a base64-encoded x402 payment header (x402 v1 spec format).
 */
async function signEIP3009({ privateKey, payTo, maxAmountRequired, network, asset, extra }) {
  const pk = getPrivateKey(privateKey);
  const account = privateKeyToAccount(pk);

  // Use crypto.webcrypto for nonce (matches x402 spec)
  const crypto = require('crypto').webcrypto;
  const nonce = `0x${Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex')}`;

  const now = Math.floor(Date.now() / 1000);
  const validAfter = String(now - 600);       // 10 min before (x402 spec)
  const validBefore = String(now + 300);       // 5 min window

  // EIP-712 domain (uses USDC token metadata)
  const domain = {
    name: extra?.name || 'USD Coin',
    version: extra?.version || '2',
    chainId: 8453,
    verifyingContract: asset || USDC_BASE,
  };

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: viemHttp('https://mainnet.base.org'),
  });

  const signature = await walletClient.signTypedData({
    domain,
    types: EIP3009_TYPES,
    primaryType: 'TransferWithAuthorization',
    message: {
      from: account.address,
      to: payTo,
      value: maxAmountRequired,   // pass as string (matches x402 reference impl)
      validAfter,                 // string
      validBefore,                // string
      nonce,
    },
  });

  // x402 v1 standard payment header format
  const headerPayload = {
    x402Version: 1,
    scheme: 'exact',
    network: network || 'base',
    payload: {
      signature,
      authorization: {
        from: account.address,
        to: payTo,
        value: maxAmountRequired,
        validAfter,
        validBefore,
        nonce,
      },
    },
  };

  return Buffer.from(JSON.stringify(headerPayload)).toString('base64');
}

// ─── x402Fetch ───────────────────────────────────────────────────────────────

/**
 * Fetch a URL with automatic x402 payment handling.
 *
 * Flow:
 *   1. Make initial request
 *   2. If 402 → read payment requirements → sign EIP-3009 → retry with header
 *   3. Return final response
 *
 * @param {string} url
 * @param {object} options  - method, headers, body (string or object)
 * @param {object} payOpts  - { privateKey, maxAmount, network, token }
 */
async function x402Fetch(url, options = {}, payOpts = {}) {
  const {
    privateKey = null,
    maxAmount = null, // safety cap — refuse to pay more than this
    network = 'base',
    token = 'USDC',
  } = payOpts;

  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const body = typeof options.body === 'string' ? options.body : (options.body ? JSON.stringify(options.body) : null);

  // Step 1: Initial request
  const initial = await httpRequest(url, { method: options.method || 'GET', headers }, body ? JSON.parse(body) : null);

  if (initial.status !== 402) {
    return initial; // Not a paid endpoint, return as-is
  }

  // Step 2: Parse standard x402 payment requirements (accepts[] format)
  const responseBody = initial.body;
  const accepts = responseBody?.accepts || [];
  const req0 = accepts[0]; // pick first accepted payment method

  if (!req0) {
    throw new Error(`x402: Got 402 but no accepts[] in requirements. Raw: ${JSON.stringify(responseBody)}`);
  }

  const requiredAmount = req0.maxAmountRequired;        // e.g. "2000000" (USDC units)
  const requiredAmountUSDC = (parseInt(requiredAmount) / 1e6).toFixed(2);
  const requiredNetwork = req0.network || network;
  const payTo = req0.payTo;                             // intermediate address
  const asset = req0.asset;
  const extra = req0.extra || {};

  // Safety cap check (compare in USDC float)
  if (maxAmount !== null && parseFloat(requiredAmountUSDC) > parseFloat(maxAmount)) {
    throw new Error(`x402: Endpoint requires ${requiredAmountUSDC} USDC but maxAmount is ${maxAmount}`);
  }

  console.log(`[x402] 💳 Paying ${requiredAmountUSDC} USDC on ${requiredNetwork} → ${url}`);

  // Step 3: Sign EIP-3009 with correct x402 format
  const paymentHeader = await signEIP3009({
    privateKey,
    payTo,
    maxAmountRequired: requiredAmount,
    network: requiredNetwork,
    asset,
    extra,
  });

  // Step 4: Retry with payment header
  const paid = await httpRequest(
    url,
    {
      method: options.method || 'GET',
      headers: { ...headers, 'X-Payment': paymentHeader },
    },
    body ? JSON.parse(body) : null
  );

  if (paid.status === 402) {
    throw new Error(`x402: Payment rejected. Server response: ${JSON.stringify(paid.body)}`);
  }

  return paid;
}

// ─── Client factory ───────────────────────────────────────────────────────────

/**
 * Create a pre-configured x402 client with persistent settings.
 *
 * const client = createX402Client({ network: 'base', maxAmount: '5.00' });
 * const res = await client.fetch('https://...', { method: 'POST', body: {...} });
 */
function createX402Client(defaults = {}) {
  return {
    fetch: (url, options = {}, overrides = {}) =>
      x402Fetch(url, options, { ...defaults, ...overrides }),

    /**
     * Pay a specific endpoint directly via onchain.fi /v1/pay
     * Use when you already know the amount and just want to pay.
     */
    pay: async ({ url, amount, to, sourceNetwork, destinationNetwork, token, privateKey } = {}) => {
      const pk = defaults.privateKey || privateKey;
      const net = sourceNetwork || defaults.network || 'base';
      const dst = destinationNetwork || defaults.destinationNetwork || 'base';

      const paymentHeader = await signEIP3009({
        privateKey: pk,
        to,
        amount,
        token: token || defaults.token || 'USDC',
        network: net,
      });

      return onchainPost('/v1/pay', {
        paymentHeader,
        to,
        sourceNetwork: net,
        destinationNetwork: dst,
        expectedAmount: String(amount),
        expectedToken: token || 'USDC',
        priority: defaults.priority || 'balanced',
      });
    },
  };
}

module.exports = { x402Fetch, createX402Client, signEIP3009, getPrivateKey };
