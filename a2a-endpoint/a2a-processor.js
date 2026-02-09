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
    console.log(`📨 Queuing A2A message from ${from}`);
    
    // Write to queue for Mr. Tee to process during heartbeat
    const queueDir = path.join(WORKSPACE_DIR, 'queue');
    await fs.mkdir(queueDir, { recursive: true });
    
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
    console.error(`❌ A2A queueing error:`, error);
    
    return {
      status: 'error',
      error: error.message,
      timestamp
    };
  }
}

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
