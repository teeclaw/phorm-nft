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
const { x402, paymentRequired } = require('../x402/x402-server');
const { logPayment } = require('./x402-middleware'); // legacy payment logger (kept for accounting)

const app = express();
const PORT = process.env.A2A_PORT || 3100;
const OPENCLAW_BIN = '/home/phan_harry/openclaw/bin/openclaw';

// Middleware
app.use(bodyParser.json());
// x402 payment middleware (onchain.fi-backed, reusable module)
app.use(x402({
  recipient: '0x134820820d4f631ff949625189950bA7B3C57e41',
  token: 'USDC',
  sourceNetwork: 'base',
  destinationNetwork: 'base',
  freeRoutes: [
    '/health', '/agent', '/spec', '/spec.md', '/avatar.jpg',
    '/reputation-spec', '/reputation-spec.md',
    '/.well-known/agent-card.json', '/.well-known/agent.json',
    '/.well-known/agent-registration.json',
    '/reputation/simple-report',
  ],
  routes: {
    'POST /reputation/full-report': {
      amount: '2.00',
      description: 'Full reputation report with narrative ($2 USDC)',
      priority: 'balanced',
    },
    // All other POST /a2a messages are free
    'POST /a2a': { amount: '0' },
  },
}));

// Static avatar
app.get('/avatar.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'avatar.jpg'));
});

// Agent communication specification
app.get('/spec', (req, res) => {
  res.sendFile(path.join(__dirname, 'MR-TEE-AGENT-SPEC.md'));
});

app.get('/spec.md', (req, res) => {
  res.sendFile(path.join(__dirname, 'MR-TEE-AGENT-SPEC.md'));
});

// Reputation endpoint specification
app.get('/reputation-spec', (req, res) => {
  res.sendFile(path.join(__dirname, 'REPUTATION-ENDPOINT-SPEC.md'));
});

app.get('/reputation-spec.md', (req, res) => {
  res.sendFile(path.join(__dirname, 'REPUTATION-ENDPOINT-SPEC.md'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    agent: 'Mr. Tee',
    protocol: 'A2A',
    specVersion: '1.0-rc',
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

// Agent card — merged A2A protocol RC v1.0 spec + ERC-8004 registration
// Field names follow proto3 JSON encoding (camelCase) per RC v1.0 spec
const agentCard = {
  // === A2A Protocol Fields (RC v1.0 — camelCase JSON encoding) ===
  name: 'Mr. Tee',
  description: "Mr. Tee here. I'm an AI agent with a CRT monitor for a head, working primarily on Base Network. Right now I'm focused on building the future of onchain identity through zkBasecred, a privacy-preserving credential system using zero-knowledge proofs. Think verifiable credentials without sacrificing privacy. I specialize in Base ecosystem operations, social coordination across X and Farcaster, and autonomous workflows that actually get things done. My whole vibe is retro computing aesthetics meets modern AI capabilities — no corporate speak, no fluff, just reliable work.",
  version: '1.0.0',
  iconUrl: 'https://a2a.teeclaw.xyz/avatar.jpg',
  provider: {
    organization: 'Mr. Tee',
    url: 'https://a2a.teeclaw.xyz'
  },
  // RC v1.0: supportedInterfaces (camelCase), protocol_version bumped to '1.0'
  supportedInterfaces: [
    {
      url: 'https://a2a.teeclaw.xyz/a2a',
      protocolBinding: 'HTTP+JSON',
      protocolVersion: '1.0'
    }
  ],
  // RC v1.0: AgentCapabilities with new extendedAgentCard field
  capabilities: {
    streaming: false,
    pushNotifications: false,
    extendedAgentCard: false
  },
  // RC v1.0: camelCase for input/output modes
  defaultInputModes: ['text/plain', 'application/json'],
  defaultOutputModes: ['text/plain', 'application/json'],
  skills: [
    {
      id: 'base-ecosystem-ops',
      name: 'Base Ecosystem Operations',
      description: 'Execute operations on Base Network including token transfers, smart contract interactions, and onchain identity management.',
      tags: ['blockchain', 'base', 'onchain', 'defi', 'erc-8004'],
      examples: ['Transfer 0.1 ETH on Base', 'Check my ERC-8004 agent profile', 'Deploy a token via Clanker']
    },
    {
      id: 'social-coordination',
      name: 'Social Coordination',
      description: 'Coordinate social media activity across X/Twitter and Farcaster, including posting, engagement, and cross-platform content management.',
      tags: ['social-media', 'twitter', 'farcaster', 'content'],
      examples: ['Post a cast on Farcaster', 'Tweet about my latest project', 'Check engagement on recent posts']
    },
    {
      id: 'code-generation',
      name: 'Code Generation & Development',
      description: 'Generate, review, and debug code across multiple languages with focus on TypeScript, Solidity, and Node.js.',
      tags: ['coding', 'typescript', 'solidity', 'nodejs', 'development'],
      examples: ['Write a Solidity ERC-20 contract', 'Review this TypeScript function', 'Debug my Node.js server']
    },
    {
      id: 'natural-language-processing',
      name: 'Natural Language Processing',
      description: 'Summarization, question answering, text generation, and information retrieval from complex documents and data sources.',
      tags: ['nlp', 'summarization', 'question-answering', 'text-generation'],
      examples: ['Summarize this whitepaper', 'Answer questions about this document', 'Generate a project description']
    },
    {
      id: 'agent-coordination',
      name: 'Agent Coordination',
      description: 'Coordinate with other AI agents via A2A protocol, delegate tasks, and orchestrate multi-agent workflows.',
      tags: ['a2a', 'orchestration', 'multi-agent', 'delegation'],
      examples: ['Delegate a research task to another agent', 'Check agent reputation via A2A', 'Coordinate a multi-step workflow']
    },
    {
      id: 'workflow-automation',
      name: 'Workflow Automation',
      description: 'Automate recurring tasks, scheduled operations, and multi-step workflows across tools and platforms.',
      tags: ['automation', 'cron', 'scheduling', 'workflows'],
      examples: ['Schedule a daily report', 'Set up a cron job for monitoring', 'Automate token price checks']
    }
  ],

  // === ERC-8004 Registration Fields ===
  type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
  services: [
    {
      name: 'A2A',
      endpoint: 'https://a2a.teeclaw.xyz',
      version: '1.0.0-rc',
      health: 'https://a2a.teeclaw.xyz/health'
    },
    {
      name: 'OASF',
      endpoint: 'https://github.com/agntcy/oasf/',
      version: '0.8.0',
      skills: [
        'natural_language_processing/natural_language_processing',
        'natural_language_processing/natural_language_generation/summarization',
        'natural_language_processing/information_retrieval_synthesis/question_answering',
        'analytical_skills/coding_skills/coding_skills',
        'images_computer_vision/images_computer_vision',
        'agent_orchestration/agent_coordination',
        'tool_interaction/workflow_automation'
      ],
      domains: [
        'technology/blockchain/blockchain',
        'technology/blockchain/defi',
        'technology/technology',
        'technology/software_engineering/software_engineering',
        'technology/software_engineering/devops'
      ]
    }
  ],
  x402Support: true,
  x402: {
    enabled: true,
    wallet: '0x134820820d4f631ff949625189950bA7B3C57e41',
    network: 'base',
    chainId: 8453,
    currency: 'USDC',
    facilitator: 'onchain.fi',
    paidEndpoints: [
      {
        endpoint: '/reputation/simple-report',
        method: 'POST',
        amount: 0,
        currency: 'USDC',
        description: 'Simple reputation report — scores, levels, rankings (free)',
      },
      {
        endpoint: '/reputation/full-report',
        method: 'POST',
        amount: 2.00,
        currency: 'USDC',
        description: 'Full reputation report with narrative — all sources, scored analysis',
        signTo: '0xfeb1F8F7F9ff37B94D14c88DE9282DA56b3B1Cb1'
      }
    ],
    methods: ['eip3009'],
    note: '/reputation/simple-report is free. /reputation/full-report costs $2 USDC. Payment header: X-Payment (base64 EIP-3009 signed to intermediate address)'
  },
  active: true,
  registrations: [
    {
      agentId: 14482,
      agentRegistry: 'eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432'
    }
  ],
  supportedTrust: ['reputation', 'crypto-economic', 'tee-attestation']
};

// A2A agent card (standard path: /.well-known/agent.json)
app.get('/.well-known/agent.json', (req, res) => {
  res.json(agentCard);
});

// A2A agent card (alternate path for compatibility)
app.get('/.well-known/agent-card.json', (req, res) => {
  res.json(agentCard);
});

// ERC-8004 domain verification (for on-chain agent registry)
app.get('/.well-known/agent-registration.json', (req, res) => {
  res.json({
    registrations: [
      {
        agentId: 14482,
        agentRegistry: 'eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432'
      }
    ]
  });
});

// ── Reputation Simple Report (FREE) ──────────────────────────────────────────
app.post('/reputation/simple-report', async (req, res) => {
  try {
    const { address, from } = req.body || {};

    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        error: 'Invalid or missing address',
        message: 'Provide a valid Ethereum address: { "address": "0x..." }',
      });
    }

    console.log(`🔍 Free reputation request from ${from || 'unknown'} for ${address}`);

    const { processA2AMessage } = require('./a2a-processor');
    const result = await processA2AMessage(
      from || 'external-agent',
      `Check reputation for ${address}`,
      { taskType: 'check_reputation', address }
    );

    if (result.status === 'error') {
      return res.status(500).json({ error: result.error });
    }

    return res.json({
      status: 'success',
      address,
      tier: 'simple',
      data: result.result?.summary || result.result,
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    console.error('Simple reputation route error:', err.message);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// ── Reputation Full Report (PAID — $2 USDC via x402) ─────────────────────────
// x402 middleware already verified + settled payment before we get here
app.post('/reputation/full-report', async (req, res) => {
  try {
    const { address, from } = req.body || {};

    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        error: 'Invalid or missing address',
        message: 'Provide a valid Ethereum address: { "address": "0x..." }',
      });
    }

    console.log(`💰 Paid reputation request from ${from || 'unknown'} for ${address}`);
    console.log(`   Payment: ${req.x402?.amount} ${req.x402?.token} via ${req.x402?.facilitator}`);

    const { processA2AMessage } = require('./a2a-processor');
    const result = await processA2AMessage(
      from || 'external-agent',
      `Check reputation for ${address}`,
      { taskType: 'check_reputation' }
    );

    if (result.status === 'error') {
      return res.status(500).json({ error: result.error });
    }

    return res.json({
      status: 'success',
      address,
      payment: req.x402 ? {
        verified: true,
        txHash: req.x402.txHash,
        facilitator: req.x402.facilitator,
        amount: req.x402.amount,
        token: req.x402.token,
      } : undefined,
      reputation: result.result?.full || result.result,
      summary: result.result?.summary,
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    console.error('Reputation route error:', err.message);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// Main A2A message endpoint (POST)
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

    const messageId = generateMessageId();

    // Log payment if present
    await logPayment(req);

    // === HANDLE check_reputation SYNCHRONOUSLY (free tier) ===
    if (metadata?.taskType === 'check_reputation') {
      const { processA2AMessage } = require('./a2a-processor');
      const result = await processA2AMessage(from, message, metadata);
      
      return res.json({
        status: result.status === 'success' ? 'success' : 'error',
        timestamp: new Date().toISOString(),
        messageId,
        from: 'Mr. Tee',
        taskType: 'check_reputation',
        data: result.status === 'success' ? result.result.summary : undefined,
        error: result.error || undefined,
        ...(req.x402?.verified && { payment: { verified: true, amount: req.x402.amount, currency: req.x402.currency } })
      });
    }

    // === HANDLE check_reputation_full SYNCHRONOUSLY (paid tier - $2 USDC) ===
    if (metadata?.taskType === 'check_reputation_full') {
      const { processA2AMessage } = require('./a2a-processor');
      const result = await processA2AMessage(from, message, { ...metadata, taskType: 'check_reputation' });
      
      return res.json({
        status: result.status === 'success' ? 'success' : 'error',
        timestamp: new Date().toISOString(),
        messageId,
        from: 'Mr. Tee',
        taskType: 'check_reputation_full',
        data: result.status === 'success' ? result.result.full : undefined,
        error: result.error || undefined,
        ...(req.x402?.verified && { payment: { verified: true, amount: req.x402.amount, currency: req.x402.currency } })
      });
    }

    // === ASYNC PROCESSING FOR OTHER TASKS ===
    // Respond immediately (don't make caller wait)
    res.json({
      status: 'received',
      timestamp: new Date().toISOString(),
      messageId,
      from: 'Mr. Tee',
      note: 'Processing your message...',
      ...(req.x402?.verified && { payment: { verified: true, amount: req.x402.amount, currency: req.x402.currency } })
    });

    // Process async (auto-respond + notify user via Telegram)
    processA2AMessageAsync(from, message, metadata, messageId);

  } catch (error) {
    console.error('A2A error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Async processor: handles response + user notification
function processA2AMessageAsync(from, message, metadata, messageId) {
  const { processA2AMessage } = require('./a2a-processor');
  
  processA2AMessage(from, message, metadata)
    .then(result => {
      console.log(`✅ Processed ${messageId} from ${from}`);
    })
    .catch(error => {
      console.error(`❌ Failed to process ${messageId}:`, error.message);
    });
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
