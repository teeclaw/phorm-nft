/**
 * x402-server.js — Incoming payment middleware
 * Reusable Express middleware for x402 payment verification via onchain.fi
 *
 * Usage:
 *   const { x402, paymentRequired } = require('./x402-server');
 *
 *   // Protect a specific endpoint:
 *   app.post('/paid-endpoint', x402({ amount: '2.00', token: 'USDC', network: 'base' }), handler);
 *
 *   // Or wrap the whole app with per-route pricing:
 *   app.use(x402({
 *     routes: {
 *       'POST /a2a': { amount: '0', token: 'USDC', network: 'base' },
 *       'POST /reputation/full-report': { amount: '2.00', token: 'USDC', network: 'base' }
 *     },
 *     freeRoutes: ['/health', '/.well-known/agent-card.json']
 *   }));
 */

'use strict';

const https = require('https');

// ─── Config ──────────────────────────────────────────────────────────────────

const ONCHAIN_API = 'api.onchain.fi';
// Intermediate addresses (payments must be signed TO these, not final recipient)
const INTERMEDIATE = {
  'base-base':    '0xfeb1F8F7F9ff37B94D14c88DE9282DA56b3B1Cb1',
  'solana-solana':'DoVABZK8r9793SuR3powWCTdr2wVqwhueV9DuZu97n2L',
  'base-solana':  '0x931Cc2F11C36C34b4312496f470Ff21474F2fA42',
  'solana-base':  'AGm6Dzvd5evgWGGZtyvJE7cCTg7DKC9dNmwdubJg2toq',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getApiKey() {
  return process.env.ONCHAIN_API_KEY;
}

function onchainPost(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const options = {
      hostname: ONCHAIN_API,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'X-API-Key': getApiKey(),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Build the 402 payment requirements response body.
 * Tells the caller exactly what to sign and where.
 */
function buildPaymentRequirements(opts) {
  const src = opts.sourceNetwork || 'base';
  const dst = opts.destinationNetwork || 'base';
  const key = `${src}-${dst}`;
  return {
    error: 'Payment Required',
    x402: {
      amount: opts.amount,
      token: opts.token || 'USDC',
      sourceNetwork: src,
      destinationNetwork: dst,
      // Payer signs to the intermediate, NOT recipient wallet
      signTo: INTERMEDIATE[key] || INTERMEDIATE['base-base'],
      recipient: opts.recipient,
      description: opts.description || 'x402 payment required',
    },
  };
}

// ─── Core verify + settle via onchain.fi ─────────────────────────────────────

/**
 * Verify and settle a payment via onchain.fi /v1/pay
 * Returns { ok: true, txHash, facilitator } or { ok: false, reason }
 */
async function verifyAndSettle(paymentHeader, opts) {
  const result = await onchainPost('/v1/pay', {
    paymentHeader,
    to: opts.recipient,
    sourceNetwork: opts.sourceNetwork || 'base',
    destinationNetwork: opts.destinationNetwork || 'base',
    expectedAmount: String(opts.amount),
    expectedToken: opts.token || 'USDC',
    priority: opts.priority || 'balanced',
  });

  if (result.status === 200 && result.body?.data?.settled) {
    return {
      ok: true,
      txHash: result.body.data.txHash,
      facilitator: result.body.data.facilitator,
      amount: result.body.data.amount,
    };
  }

  return {
    ok: false,
    reason: result.body?.error || result.body?.message || `onchain.fi returned ${result.status}`,
    raw: result.body,
  };
}

// ─── Middleware factory ───────────────────────────────────────────────────────

/**
 * x402(opts) — Express middleware factory
 *
 * Single-route mode:
 *   app.post('/paid', x402({ amount: '1.00', recipient: '0x...' }), handler)
 *
 * Multi-route mode:
 *   app.use(x402({
 *     recipient: '0x...',
 *     freeRoutes: ['/health'],
 *     routes: {
 *       'POST /premium': { amount: '2.00' },
 *       'GET /report':   { amount: '0.50', priority: 'speed' },
 *     }
 *   }))
 */
function x402(opts = {}) {
  const {
    recipient,
    token = 'USDC',
    sourceNetwork = 'base',
    destinationNetwork = 'base',
    priority = 'balanced',
    freeRoutes = [],
    routes = null,
    onPayment = null,
  } = opts;

  return async function x402Middleware(req, res, next) {
    // ── Resolve route config ─────────────────────────────────────────────────
    let routeOpts = null;

    if (routes) {
      // Multi-route mode: match "METHOD /path"
      const key = `${req.method} ${req.path}`;
      routeOpts = routes[key] || null;
    } else if (opts.amount !== undefined) {
      // Single-route mode
      routeOpts = opts;
    }

    // Free route or no config → skip
    if (!routeOpts || freeRoutes.includes(req.path)) {
      return next();
    }

    const effectiveOpts = {
      recipient: routeOpts.recipient || recipient,
      amount: routeOpts.amount ?? opts.amount ?? '0',
      token: routeOpts.token || token,
      sourceNetwork: routeOpts.sourceNetwork || sourceNetwork,
      destinationNetwork: routeOpts.destinationNetwork || destinationNetwork,
      priority: routeOpts.priority || priority,
      description: routeOpts.description || opts.description,
    };

    // Free endpoint (amount = 0) → pass through
    if (parseFloat(effectiveOpts.amount) === 0) {
      return next();
    }

    // ── Check for payment header ─────────────────────────────────────────────
    const paymentHeader = req.headers['x-payment'] || req.headers['x402-payment'];

    if (!paymentHeader) {
      return res.status(402).json(buildPaymentRequirements(effectiveOpts));
    }

    // ── Verify + settle via onchain.fi ───────────────────────────────────────
    try {
      const result = await verifyAndSettle(paymentHeader, effectiveOpts);

      if (!result.ok) {
        return res.status(402).json({
          error: 'Payment verification failed',
          reason: result.reason,
        });
      }

      // Attach payment info to request for downstream handlers
      req.x402 = {
        verified: true,
        txHash: result.txHash,
        facilitator: result.facilitator,
        amount: result.amount,
        token: effectiveOpts.token,
        network: effectiveOpts.destinationNetwork,
      };

      if (onPayment) {
        await onPayment(req.x402, req, res);
      }

      return next();

    } catch (err) {
      console.error('[x402] Verification error:', err.message);
      return res.status(500).json({ error: 'Payment verification error', message: err.message });
    }
  };
}

// ─── Helper: build 402 response manually (for non-Express use) ───────────────
function paymentRequired(opts) {
  return { status: 402, body: buildPaymentRequirements(opts) };
}

module.exports = { x402, paymentRequired, verifyAndSettle, INTERMEDIATE, buildPaymentRequirements };
