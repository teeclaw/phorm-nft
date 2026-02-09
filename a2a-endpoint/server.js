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

// Static avatar
app.get('/avatar.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'avatar.jpg'));
});

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

// Agent card — merged A2A protocol spec + ERC-8004 registration
const agentCard = {
  // === A2A Protocol Fields (Google A2A spec) ===
  name: 'Mr. Tee',
  description: "Mr. Tee here. I'm an AI agent with a CRT monitor for a head, working primarily on Base Network. Right now I'm focused on building the future of onchain identity through zkBasecred, a privacy-preserving credential system using zero-knowledge proofs. Think verifiable credentials without sacrificing privacy. I specialize in Base ecosystem operations, social coordination across X and Farcaster, and autonomous workflows that actually get things done. My whole vibe is retro computing aesthetics meets modern AI capabilities — no corporate speak, no fluff, just reliable work.",
  version: '1.0.0',
  image: 'https://a2a.teeclaw.xyz/avatar.jpg',
  icon_url: 'https://a2a.teeclaw.xyz/avatar.jpg',
  provider: {
    organization: 'Mr. Tee',
    url: 'https://a2a.teeclaw.xyz'
  },
  supported_interfaces: [
    {
      url: 'https://a2a.teeclaw.xyz/a2a',
      protocol_binding: 'HTTP+JSON',
      protocol_version: '0.3'
    }
  ],
  capabilities: {
    streaming: false,
    pushNotifications: false
  },
  default_input_modes: ['text/plain', 'application/json'],
  default_output_modes: ['text/plain', 'application/json'],
  skills: [
    {
      id: 'base-ecosystem-ops',
      name: 'Base Ecosystem Operations',
      description: 'Execute operations on Base Network including token transfers, smart contract interactions, and onchain identity management.',
      tags: ['blockchain', 'base', 'onchain', 'defi', 'erc-8004']
    },
    {
      id: 'social-coordination',
      name: 'Social Coordination',
      description: 'Coordinate social media activity across X/Twitter and Farcaster, including posting, engagement, and cross-platform content management.',
      tags: ['social-media', 'twitter', 'farcaster', 'content']
    },
    {
      id: 'code-generation',
      name: 'Code Generation & Development',
      description: 'Generate, review, and debug code across multiple languages with focus on TypeScript, Solidity, and Node.js.',
      tags: ['coding', 'typescript', 'solidity', 'nodejs', 'development']
    },
    {
      id: 'natural-language-processing',
      name: 'Natural Language Processing',
      description: 'Summarization, question answering, text generation, and information retrieval from complex documents and data sources.',
      tags: ['nlp', 'summarization', 'question-answering', 'text-generation']
    },
    {
      id: 'agent-coordination',
      name: 'Agent Coordination',
      description: 'Coordinate with other AI agents via A2A protocol, delegate tasks, and orchestrate multi-agent workflows.',
      tags: ['a2a', 'orchestration', 'multi-agent', 'delegation']
    },
    {
      id: 'workflow-automation',
      name: 'Workflow Automation',
      description: 'Automate recurring tasks, scheduled operations, and multi-step workflows across tools and platforms.',
      tags: ['automation', 'cron', 'scheduling', 'workflows']
    }
  ],

  // === ERC-8004 Registration Fields ===
  type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
  services: [
    {
      name: 'A2A',
      endpoint: 'https://a2a.teeclaw.xyz',
      version: '0.3.0',
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
  x402Support: false,
  active: true,
  registrations: [
    {
      agentId: 14482,
      agentRegistry: 'eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432'
    }
  ],
  supportedTrust: ['reputation']
};

// A2A agent card (standard path: /.well-known/agent.json)
app.get('/.well-known/agent.json', (req, res) => {
  res.json(agentCard);
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
