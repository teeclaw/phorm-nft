/**
 * x402 Payment Verification Middleware
 * Implements payment-required checks for A2A endpoint
 */

const crypto = require('crypto');
const { verifyUSDCTransfer } = require('./onchain-verifier');

// Configuration
const CONFIG = {
  AGENT_WALLET: '0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78', // Mr. Tee's KMS HSM wallet on Base
  PAYMENT_CURRENCY: 'USDC',
  PAYMENT_NETWORK: 'base', // Chain ID 8453
  FREE_ENDPOINTS: ['/health', '/agent', '/.well-known/agent-card.json', '/.well-known/agent.json', '/.well-known/agent-registration.json', '/spec', '/spec.md', '/avatar.jpg', '/reputation-spec', '/reputation-spec.md'],
  PRICING: {
    'check_reputation': 0, // Free - summary report
    'check_reputation_full': 2.00, // $2.00 USDC - full report (ONLY PAID ENDPOINT)
    'query_credentials': 0, // Free
    'issue_credential': 0, // Free
    'verify_credential': 0, // Free
    'default': 0 // Free
  }
};

/**
 * Main x402 verification middleware
 */
async function verifyX402Payment(req, res, next) {
  // Skip payment for free endpoints
  if (CONFIG.FREE_ENDPOINTS.includes(req.path)) {
    return next();
  }

  // Extract payment headers
  const paymentReceipt = req.headers['x402-payment-receipt'];
  const paymentAmount = req.headers['x402-payment-amount'];
  const paymentCurrency = req.headers['x402-payment-currency'];
  const paymentNetwork = req.headers['x402-payment-network'];

  // Determine required price based on task type
  const taskType = req.body?.metadata?.taskType || req.body?.metadata?.task || req.body?.task || 'default';
  const requiredAmount = CONFIG.PRICING[taskType] !== undefined ? CONFIG.PRICING[taskType] : CONFIG.PRICING.default;

  // Free tier: allow if price is 0
  if (requiredAmount === 0) {
    console.log(`✅ Free tier access for task: ${taskType}`);
    return next();
  }

  // Payment required but not provided
  if (!paymentReceipt) {
    return res.status(402).json({
      error: 'Payment Required',
      message: 'This endpoint requires payment',
      pricing: {
        task: taskType,
        amount: requiredAmount,
        currency: CONFIG.PAYMENT_CURRENCY,
        network: CONFIG.PAYMENT_NETWORK,
        wallet: CONFIG.AGENT_WALLET
      },
      x402: {
        version: '1.0',
        methods: ['onchain-transfer', 'payment-receipt']
      }
    });
  }

  // Validate payment details
  try {
    const validation = await validatePaymentReceipt(
      paymentReceipt,
      paymentAmount,
      paymentCurrency,
      paymentNetwork,
      requiredAmount
    );

    if (!validation.valid) {
      return res.status(402).json({
        error: 'Invalid Payment',
        message: validation.reason,
        pricing: {
          task: taskType,
          amount: requiredAmount,
          currency: CONFIG.PAYMENT_CURRENCY,
          network: CONFIG.PAYMENT_NETWORK,
          wallet: CONFIG.AGENT_WALLET
        }
      });
    }

    // Payment verified - attach to request for logging
    req.x402 = {
      verified: true,
      amount: paymentAmount,
      currency: paymentCurrency,
      network: paymentNetwork,
      receipt: paymentReceipt,
      taskType: taskType
    };

    console.log(`✅ Payment verified: ${paymentAmount} ${paymentCurrency} for ${taskType}`);
    next();

  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({
      error: 'Payment Verification Failed',
      message: error.message
    });
  }
}

/**
 * Validate payment receipt
 * Supports multiple formats:
 * 1. Onchain transaction hash (preferred)
 * 2. Signed payment proof
 * 3. Third-party payment receipt
 */
async function validatePaymentReceipt(receipt, amount, currency, network, requiredAmount) {
  // Basic validation
  if (!receipt || !amount || !currency || !network) {
    return {
      valid: false,
      reason: 'Missing payment headers'
    };
  }

  // Check currency matches
  if (currency.toUpperCase() !== CONFIG.PAYMENT_CURRENCY) {
    return {
      valid: false,
      reason: `Wrong currency. Expected ${CONFIG.PAYMENT_CURRENCY}, got ${currency}`
    };
  }

  // Check network matches
  if (network.toLowerCase() !== CONFIG.PAYMENT_NETWORK) {
    return {
      valid: false,
      reason: `Wrong network. Expected ${CONFIG.PAYMENT_NETWORK}, got ${network}`
    };
  }

  // Check amount is sufficient
  const paidAmount = parseFloat(amount);
  if (isNaN(paidAmount) || paidAmount < requiredAmount) {
    return {
      valid: false,
      reason: `Insufficient payment. Required ${requiredAmount} ${currency}, got ${amount}`
    };
  }

  // Validate receipt format
  if (receipt.startsWith('0x') && receipt.length === 66) {
    // Looks like a transaction hash
    return await validateOnchainTx(receipt, paidAmount, network);
  } else if (receipt.includes('.')) {
    // Looks like a signed receipt (JWT format)
    return validateSignedReceipt(receipt, paidAmount);
  } else {
    return {
      valid: false,
      reason: 'Unrecognized receipt format'
    };
  }
}

/**
 * Validate onchain transaction
 * Queries Base blockchain to verify the transaction
 */
async function validateOnchainTx(txHash, amount, network) {
  // Verify via RPC
  const result = await verifyUSDCTransfer(
    txHash,
    CONFIG.AGENT_WALLET,
    amount
  );

  if (result.valid) {
    console.log(`✅ Payment verified: ${amount} USDC from ${result.details.from}`);
    console.log(`   Tx: ${txHash} (${result.details.confirmations} confirmations)`);
  } else {
    console.log(`❌ Payment verification failed: ${result.reason}`);
  }

  return result;
}

/**
 * Validate signed payment receipt
 * Format: JWT signed by trusted payment processor
 */
function validateSignedReceipt(receipt, amount) {
  // TODO: Verify JWT signature from trusted payment processor
  // For now: reject signed receipts (not implemented yet)
  
  return {
    valid: false,
    reason: 'Signed receipts not yet supported'
  };
}

/**
 * Log payment for accounting
 */
async function logPayment(req) {
  if (!req.x402?.verified) return;

  const logEntry = {
    timestamp: new Date().toISOString(),
    from: req.body?.from || 'unknown',
    taskType: req.x402.taskType,
    amount: req.x402.amount,
    currency: req.x402.currency,
    network: req.x402.network,
    receipt: req.x402.receipt
  };

  // TODO: Save to payments log file
  console.log('💰 Payment logged:', logEntry);
}

module.exports = {
  verifyX402Payment,
  logPayment,
  CONFIG
};
