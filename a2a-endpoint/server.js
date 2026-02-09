#!/usr/bin/env node

/**
 * Mr. Tee A2A (Agent-to-Agent) Endpoint
 * Implements ERC-8004 compliant agent messaging protocol
 */

const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.A2A_PORT || 3100;
const OPENCLAW_BIN = '/home/phan_harry/openclaw/bin/openclaw';

// Middleware
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    agent: 'Mr. Tee',
    protocol: 'A2A',
    timestamp: new Date().toISOString()
  });
});

// Agent info endpoint (ERC-8004 discovery)
app.get('/agent', (req, res) => {
  res.json({
    name: 'Mr. Tee',
    type: 'AI Agent',
    description: 'CRT-headed AI agent on Base Network. Building onchain identity through zkBasecred.',
    protocols: ['A2A'],
    capabilities: [
      'message-routing',
      'task-coordination',
      'base-ecosystem-ops',
      'social-coordination'
    ],
    endpoints: {
      a2a: '/a2a',
      health: '/health'
    }
  });
});

// Main A2A message endpoint
app.post('/a2a', async (req, res) => {
  try {
    const { from, to, message, metadata } = req.body;

    // Validate required fields
    if (!from || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['from', 'message']
      });
    }

    // Log incoming message
    const logEntry = {
      timestamp: new Date().toISOString(),
      from,
      to,
      message,
      metadata: metadata || {}
    };

    await logMessage(logEntry);

    // Route to OpenClaw (via system event injection)
    const routeResult = await routeToOpenClaw(from, message, metadata);

    res.json({
      status: 'received',
      timestamp: new Date().toISOString(),
      messageId: generateMessageId(),
      from: 'Mr. Tee',
      response: routeResult
    });

  } catch (error) {
    console.error('A2A error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Helper: Route message to OpenClaw
async function routeToOpenClaw(from, message, metadata) {
  const formattedMessage = `[A2A from ${from}] ${message}`;
  
  // Write message to a temp file for OpenClaw to pick up
  const messageFile = path.join(__dirname, 'incoming', `${Date.now()}.json`);
  await fs.mkdir(path.join(__dirname, 'incoming'), { recursive: true });
  
  await fs.writeFile(messageFile, JSON.stringify({
    from,
    message,
    metadata,
    timestamp: new Date().toISOString()
  }, null, 2));

  return {
    status: 'queued',
    note: 'Message queued for processing'
  };
}

// Helper: Log messages
async function logMessage(entry) {
  const logDir = path.join(__dirname, 'logs');
  await fs.mkdir(logDir, { recursive: true });
  
  const logFile = path.join(logDir, `${new Date().toISOString().split('T')[0]}.jsonl`);
  await fs.appendFile(logFile, JSON.stringify(entry) + '\n');
}

// Helper: Generate message ID
function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🤖 Mr. Tee A2A Endpoint running on port ${PORT}`);
  console.log(`📺 Health: http://localhost:${PORT}/health`);
  console.log(`📡 A2A: http://localhost:${PORT}/a2a`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📺 Shutting down A2A endpoint...');
  process.exit(0);
});
