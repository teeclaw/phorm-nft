/**
 * A2A Message Schema v2 (v0.3.0)
 * Enhanced format with agent identity, callbacks, and threading
 * 
 * Required format:
 * {
 *   "version": "0.3.0",
 *   "from": {
 *     "name": "AgentName",
 *     "agentId": "eip155:8453:0x8004...:12345",  // optional
 *     "callbackUrl": "https://..."                // optional
 *   },
 *   "message": {
 *     "contentType": "text/plain",
 *     "content": "text or object"
 *   },
 *   "metadata": {...}  // optional
 * }
 */

const crypto = require('crypto');

/**
 * Normalize incoming message to internal format
 * @param {Object} raw - Raw incoming message
 * @returns {Object} Normalized message
 */
function normalizeMessage(raw) {
  const messageId = raw.metadata?.messageId || generateMessageId();
  const timestamp = raw.metadata?.timestamp || new Date().toISOString();
  
  // Handle both object and string formats for from/to (partial backward compat)
  const fromObj = typeof raw.from === 'object' ? raw.from : { name: raw.from };
  const toObj = typeof raw.to === 'object' ? raw.to : { 
    name: raw.to || 'Mr. Tee',
    agentId: 'eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432:18608'
  };
  
  // Handle both object and string formats for message
  const messageObj = typeof raw.message === 'object' && raw.message.content 
    ? raw.message 
    : { contentType: 'text/plain', content: raw.message };
  
  return {
    version: raw.version || '0.3.0',
    messageId,
    timestamp,
    from: {
      name: fromObj.name,
      agentId: fromObj.agentId || null,
      callbackUrl: fromObj.callbackUrl || null
    },
    to: {
      name: toObj.name || 'Mr. Tee',
      agentId: toObj.agentId || 'eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432:18608'
    },
    message: {
      contentType: messageObj.contentType || 'text/plain',
      content: messageObj.content
    },
    metadata: {
      ...raw.metadata,
      messageId,
      timestamp,
      replyTo: raw.metadata?.replyTo || null,
      threadId: raw.metadata?.threadId || null,
      priority: raw.metadata?.priority || 'normal',
      expiresAt: raw.metadata?.expiresAt || null
    }
  };
}

/**
 * Format response
 * @param {Object} normalized - Normalized request message
 * @param {Object} result - Processing result
 * @returns {Object} Response formatted for client
 */
function formatResponse(normalized, result) {
  return {
    version: '0.3.0',
    messageId: generateMessageId(),
    timestamp: new Date().toISOString(),
    replyTo: normalized.messageId,
    threadId: normalized.metadata.threadId,
    from: {
      name: 'Mr. Tee',
      agentId: 'eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432:18608'
    },
    to: {
      name: normalized.from.name,
      agentId: normalized.from.agentId,
      callbackUrl: normalized.from.callbackUrl
    },
    message: {
      contentType: result.contentType || 'application/json',
      content: result.data || result.message || result.note
    },
    metadata: {
      status: result.status || 'success',
      taskType: normalized.metadata.taskType,
      processingTime: result.processingTime,
      ...(result.payment && { payment: result.payment })
    }
  };
}

/**
 * Validate message schema
 * @param {Object} raw - Raw message
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateMessage(raw) {
  const errors = [];
  
  // Required: from (string or object with name)
  if (!raw.from) {
    errors.push('Missing required field: from');
  } else if (typeof raw.from === 'object' && !raw.from.name) {
    errors.push('from.name is required when from is an object');
  }
  
  // Required: message (string or object with content)
  if (!raw.message) {
    errors.push('Missing required field: message');
  } else if (typeof raw.message === 'object' && !raw.message.content) {
    errors.push('message.content is required when message is an object');
  }
  
  // Validate agentId format if provided
  if (typeof raw.from === 'object' && raw.from.agentId) {
    if (!isValidAgentId(raw.from.agentId)) {
      errors.push('Invalid agentId format (expected CAIP-2: eip155:chainId:registry:tokenId)');
    }
  }
  
  // Validate callback URL if provided
  if (typeof raw.from === 'object' && raw.from.callbackUrl) {
    if (!isValidUrl(raw.from.callbackUrl)) {
      errors.push('Invalid callbackUrl format (must be https://)');
    }
  }
  
  // Validate content type if provided
  if (typeof raw.message === 'object' && raw.message.contentType) {
    const validTypes = ['text/plain', 'application/json', 'text/markdown'];
    if (!validTypes.includes(raw.message.contentType)) {
      errors.push(`Invalid contentType (supported: ${validTypes.join(', ')})`);
    }
  }
  
  // Validate expiration if provided
  if (raw.metadata?.expiresAt) {
    const expiry = new Date(raw.metadata.expiresAt);
    if (isNaN(expiry.getTime())) {
      errors.push('Invalid expiresAt format (must be ISO 8601)');
    } else if (expiry < new Date()) {
      errors.push('Message already expired');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Helper: Generate unique message ID
 */
function generateMessageId() {
  return `msg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Helper: Validate CAIP-2 agent ID format
 */
function isValidAgentId(agentId) {
  // Format: eip155:chainId:registryAddress:tokenId
  const pattern = /^eip155:\d+:0x[a-fA-F0-9]{40}:\d+$/;
  return pattern.test(agentId);
}

/**
 * Helper: Validate URL
 */
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

module.exports = {
  normalizeMessage,
  formatResponse,
  validateMessage,
  generateMessageId
};
