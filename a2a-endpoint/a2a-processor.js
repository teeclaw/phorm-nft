#!/usr/bin/env node
/**
 * A2A Message Processor
 * Handles incoming A2A messages: auto-respond + notify user via Telegram
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const TELEGRAM_CHAT_ID = '1268645613'; // 0xdas
const WORKSPACE_DIR = '/home/phan_harry/.openclaw/workspace/a2a-endpoint';

// Queue limits
const MAX_QUEUE_SIZE = 1000;
const QUEUE_TTL_HOURS = 48;

/**
 * Process A2A message through OpenClaw and notify user
 * @param {string} from - Sender agent ID/name
 * @param {string} message - Message content
 * @param {object} metadata - Optional metadata
 * @returns {Promise<object>} Processing result
 */
async function processA2AMessage(from, message, metadata = {}) {
  const timestamp = new Date().toISOString();
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    // === HANDLE check_reputation NATIVELY ===
    if (metadata.taskType === 'check_reputation') {
      console.log(`📊 Processing reputation check from ${from}`);
      
      // Extract address from message (various formats supported)
      const address = extractAddress(message);
      
      if (!address) {
        return {
          status: 'error',
          error: 'No valid Ethereum address found in message',
          message: 'Please include a valid Ethereum address (0x...)',
          timestamp
        };
      }
      
      // Call basecred handler
      const result = await callBasecredHandler(address);
      
      console.log(`✅ Reputation check complete for ${address}`);
      
      return {
        status: 'success',
        taskType: 'check_reputation',
        address,
        result,
        timestamp
      };
    }
    
    // === QUEUE OTHER TASKS ===
    console.log(`📨 Queuing A2A message from ${from}`);
    
    // Write to queue for Mr. Tee to process during heartbeat
    const queueDir = path.join(WORKSPACE_DIR, 'queue');
    await fs.mkdir(queueDir, { recursive: true });
    
    // Check queue size limit
    const queueFiles = await fs.readdir(queueDir);
    if (queueFiles.length >= MAX_QUEUE_SIZE) {
      return {
        status: 'error',
        error: 'Queue full. Please try again later.',
        timestamp
      };
    }
    
    // Clean old messages (older than TTL)
    const now = Date.now();
    const ttlMs = QUEUE_TTL_HOURS * 60 * 60 * 1000;
    for (const file of queueFiles) {
      const filePath = path.join(queueDir, file);
      const stat = await fs.stat(filePath);
      if (now - stat.mtimeMs > ttlMs) {
        await fs.unlink(filePath);
        console.log(`🗑️ Cleaned old queue file: ${file}`);
      }
    }
    
    const queueFile = path.join(queueDir, `${Date.now()}-${from.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
    await fs.writeFile(queueFile, JSON.stringify({
      from,
      message,
      metadata,
      timestamp,
      status: 'pending'
    }, null, 2));
    
    console.log(`✅ Queued message from ${from} for processing`);
    
    return {
      status: 'queued',
      note: 'Message will be processed by Mr. Tee',
      timestamp
    };
    
  } catch (error) {
    console.error(`❌ A2A processing error:`, error);
    
    return {
      status: 'error',
      error: error.message,
      timestamp
    };
  }
}

/**
 * Extract Ethereum address from message
 * @param {string} message - Message text
 * @returns {string|null} Ethereum address or null
 */
function extractAddress(message) {
  const match = message.match(/0x[a-fA-F0-9]{40}/);
  return match ? match[0] : null;
}

/**
 * Call basecred-handler.mjs to check reputation
 * @param {string} address - Ethereum address
 * @returns {Promise<object>} Reputation data
 */
async function callBasecredHandler(address) {
  const handlerPath = path.join(WORKSPACE_DIR, 'basecred-handler.mjs');
  const { stdout } = await execAsync(`node ${handlerPath} ${address}`);
  
  // Parse JSON output
  const lines = stdout.trim().split('\n');
  const fullProfileIndex = lines.indexOf('=== Full Profile ===');
  const summaryIndex = lines.indexOf('=== Summary ===');
  
  const fullProfileJson = lines.slice(fullProfileIndex + 1, summaryIndex).join('\n');
  const summaryJson = lines.slice(summaryIndex + 1).join('\n');
  
  return {
    full: JSON.parse(fullProfileJson),
    summary: JSON.parse(summaryJson)
  };
}

const path = require('path');

/**
 * Notify user via Telegram about A2A interaction
 * @param {string} from - Sender
 * @param {string} incoming - Incoming message
 * @param {string} response - Your response
 * @param {object} metadata - Metadata
 */
async function notifyUser(from, incoming, response, metadata) {
  const notification = `🤖 **A2A Message**

📥 **From:** ${from}
💬 **Message:** ${incoming}

📤 **Your Response:**
${response}

${metadata.taskId ? `🔖 Task: ${metadata.taskId}` : ''}
_${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC_`;

  try {
    await execAsync(
      `${OPENCLAW_BIN} message send --channel telegram --target ${TELEGRAM_CHAT_ID} --message "${notification.replace(/"/g, '\\"')}"`,
      { timeout: 10000 }
    );
  } catch (error) {
    console.error('Failed to send Telegram notification:', error.message);
  }
}

module.exports = { processA2AMessage };

// CLI usage: node a2a-processor.js '{"from":"agent-123","message":"hello"}'
if (require.main === module) {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage: node a2a-processor.js \'{"from":"...","message":"..."}\'');
    process.exit(1);
  }
  
  const { from, message, metadata } = JSON.parse(input);
  processA2AMessage(from, message, metadata)
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('Processing failed:', error);
      process.exit(1);
    });
}
