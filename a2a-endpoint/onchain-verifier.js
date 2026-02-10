/**
 * Onchain Transaction Verifier
 * Verifies USDC payments on Base network via RPC
 */

const { ethers } = require('ethers');
const fs = require('fs').promises;
const path = require('path');

// Base RPC endpoint (public)
const BASE_RPC = process.env.BASE_RPC_URL || 'https://mainnet.base.org';

// USDC on Base: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const USDC_DECIMALS = 6;

// ERC-20 Transfer event signature
const TRANSFER_EVENT_SIGNATURE = ethers.id('Transfer(address,address,uint256)');

// Minimum confirmations required
const MIN_CONFIRMATIONS = 2;

// Tracking file for used tx hashes (prevent replay attacks)
const USED_TX_FILE = path.join(__dirname, 'used-transactions.json');

// Provider
let provider;

/**
 * Initialize provider
 */
function getProvider() {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(BASE_RPC);
  }
  return provider;
}

/**
 * Load used transaction hashes from disk
 */
async function loadUsedTransactions() {
  try {
    const data = await fs.readFile(USED_TX_FILE, 'utf8');
    return new Set(JSON.parse(data));
  } catch (error) {
    // File doesn't exist yet
    return new Set();
  }
}

/**
 * Save used transaction hash to disk
 */
async function markTransactionUsed(txHash) {
  const usedTxs = await loadUsedTransactions();
  usedTxs.add(txHash.toLowerCase());
  
  await fs.writeFile(
    USED_TX_FILE,
    JSON.stringify([...usedTxs], null, 2)
  );
}

/**
 * Verify USDC transfer transaction on Base
 * 
 * @param {string} txHash - Transaction hash
 * @param {string} expectedRecipient - Expected recipient address
 * @param {number} expectedAmount - Expected amount in USDC (decimal)
 * @returns {Object} { valid: boolean, reason: string, details?: Object }
 */
async function verifyUSDCTransfer(txHash, expectedRecipient, expectedAmount) {
  try {
    const provider = getProvider();
    
    // 1. Check if transaction was already used (replay attack prevention)
    const usedTxs = await loadUsedTransactions();
    if (usedTxs.has(txHash.toLowerCase())) {
      return {
        valid: false,
        reason: 'Transaction already used (replay attack prevention)'
      };
    }

    // 2. Fetch transaction receipt
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return {
        valid: false,
        reason: 'Transaction not found or pending'
      };
    }

    // 3. Check confirmations
    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber;
    
    if (confirmations < MIN_CONFIRMATIONS) {
      return {
        valid: false,
        reason: `Insufficient confirmations. Required: ${MIN_CONFIRMATIONS}, got: ${confirmations}`
      };
    }

    // 4. Check transaction succeeded
    if (receipt.status !== 1) {
      return {
        valid: false,
        reason: 'Transaction failed'
      };
    }

    // 5. Find USDC Transfer event in logs
    const transferLog = receipt.logs.find(log => 
      log.address.toLowerCase() === USDC_ADDRESS.toLowerCase() &&
      log.topics[0] === TRANSFER_EVENT_SIGNATURE
    );

    if (!transferLog) {
      return {
        valid: false,
        reason: 'No USDC transfer found in transaction'
      };
    }

    // 6. Decode Transfer event
    const iface = new ethers.Interface([
      'event Transfer(address indexed from, address indexed to, uint256 value)'
    ]);
    
    const decoded = iface.parseLog({
      topics: transferLog.topics,
      data: transferLog.data
    });

    const from = decoded.args.from;
    const to = decoded.args.to;
    const amountRaw = decoded.args.value;

    // 7. Verify recipient matches
    if (to.toLowerCase() !== expectedRecipient.toLowerCase()) {
      return {
        valid: false,
        reason: `Wrong recipient. Expected ${expectedRecipient}, got ${to}`
      };
    }

    // 8. Convert amount to decimal and verify
    const amountDecimal = Number(ethers.formatUnits(amountRaw, USDC_DECIMALS));
    
    if (amountDecimal < expectedAmount) {
      return {
        valid: false,
        reason: `Insufficient amount. Expected ${expectedAmount} USDC, got ${amountDecimal} USDC`
      };
    }

    // 9. Mark transaction as used
    await markTransactionUsed(txHash);

    // ✅ All checks passed
    return {
      valid: true,
      reason: 'Payment verified',
      details: {
        from,
        to,
        amount: amountDecimal,
        amountRaw: amountRaw.toString(),
        confirmations,
        blockNumber: receipt.blockNumber,
        txHash
      }
    };

  } catch (error) {
    console.error('Onchain verification error:', error);
    return {
      valid: false,
      reason: `Verification failed: ${error.message}`
    };
  }
}

/**
 * Check if transaction hash is already used
 */
async function isTransactionUsed(txHash) {
  const usedTxs = await loadUsedTransactions();
  return usedTxs.has(txHash.toLowerCase());
}

/**
 * Get list of used transactions (for admin/debugging)
 */
async function getUsedTransactions() {
  return await loadUsedTransactions();
}

module.exports = {
  verifyUSDCTransfer,
  isTransactionUsed,
  getUsedTransactions,
  USDC_ADDRESS,
  USDC_DECIMALS,
  MIN_CONFIRMATIONS
};
