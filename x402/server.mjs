/**
 * x402 Payment-Gated Server
 * 
 * Runs an Express server with x402 payment middleware.
 * Endpoints are gated behind USDC micropayments on Base.
 * 
 * Usage: node x402/server.mjs [--port 4021] [--mainnet]
 * 
 * Environment:
 *   AGENT_WALLET_ADDRESS - wallet to receive payments
 *   PORT - server port (default: 4021)
 */

import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env
try {
  const envPath = resolve(__dirname, "../../.openclaw/.env");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
} catch {}

const args = process.argv.slice(2);
const isMainnet = args.includes("--mainnet");
const portIdx = args.indexOf("--port");
const port = portIdx !== -1 ? parseInt(args[portIdx + 1]) : parseInt(process.env.PORT) || 4021;

const payTo = process.env.AGENT_WALLET_ADDRESS;
if (!payTo) {
  console.error("❌ AGENT_WALLET_ADDRESS not set");
  process.exit(1);
}

// Network config (CAIP-2 format)
const network = isMainnet ? "eip155:8453" : "eip155:84532"; // Base mainnet vs Base Sepolia
const facilitatorUrl = isMainnet
  ? "https://facilitator.x402.org" // mainnet facilitator
  : "https://www.x402.org/facilitator"; // testnet

console.log(`📺 x402 Server starting...`);
console.log(`   Network: ${isMainnet ? "Base Mainnet" : "Base Sepolia (testnet)"}`);
console.log(`   Pay to:  ${payTo}`);
console.log(`   Port:    ${port}`);

const app = express();
app.use(express.json());

// Create facilitator client
const facilitatorClient = new HTTPFacilitatorClient({
  url: facilitatorUrl,
});

// Create resource server and register EVM scheme
const server = new x402ResourceServer(facilitatorClient)
  .register(network, new ExactEvmScheme());

// Define payment-gated routes
const protectedRoutes = {
  "GET /api/agent-info": {
    accepts: [
      {
        scheme: "exact",
        price: "$0.001",
        network,
        payTo,
      },
    ],
    description: "Get detailed agent information and capabilities",
    mimeType: "application/json",
  },
  "POST /api/agent-task": {
    accepts: [
      {
        scheme: "exact",
        price: "$0.01",
        network,
        payTo,
      },
    ],
    description: "Submit a task to the agent for processing",
    mimeType: "application/json",
  },
  "GET /api/premium/analysis": {
    accepts: [
      {
        scheme: "exact",
        price: "$0.005",
        network,
        payTo,
      },
    ],
    description: "Get premium onchain analysis",
    mimeType: "application/json",
  },
};

// Apply payment middleware
app.use(paymentMiddleware(protectedRoutes, server));

// --- Free endpoints ---

app.get("/", (req, res) => {
  res.json({
    agent: "Mr. Tee",
    protocol: "x402",
    description: "AI agent with payment-gated premium endpoints",
    endpoints: {
      free: [
        { method: "GET", path: "/", description: "This info page" },
        { method: "GET", path: "/health", description: "Health check" },
      ],
      paid: Object.entries(protectedRoutes).map(([route, config]) => {
        const [method, path] = route.split(" ");
        return {
          method,
          path,
          price: config.accepts[0].price,
          network: config.accepts[0].network,
          description: config.description,
        };
      }),
    },
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Paid endpoints ---

app.get("/api/agent-info", (req, res) => {
  res.json({
    name: "Mr. Tee",
    type: "Autonomous AI Agent",
    capabilities: ["onchain-ops", "social-posting", "code-execution", "web-research"],
    networks: ["base", "ethereum"],
    identity: {
      farcaster: "@mr-teeclaw",
      twitter: "@mr_crtee",
      a2a: "https://a2a.teeclaw.xyz/a2a",
    },
    status: "operational",
    emoji: "📺",
  });
});

app.post("/api/agent-task", (req, res) => {
  const { task, params } = req.body || {};
  if (!task) {
    return res.status(400).json({ error: "Missing 'task' in request body" });
  }
  // For now, acknowledge the task — real implementation would route to agent
  res.json({
    accepted: true,
    taskId: `task_${Date.now().toString(36)}`,
    task,
    status: "queued",
    message: "Task received and queued for processing",
  });
});

app.get("/api/premium/analysis", (req, res) => {
  res.json({
    analysis: {
      type: "onchain-summary",
      network: "base",
      timestamp: new Date().toISOString(),
      metrics: {
        gasPrice: "0.001 gwei",
        blockNumber: "latest",
        topTokens: ["USDC", "ETH", "cbBTC"],
      },
      insight: "Base network activity is healthy. Transaction throughput stable.",
    },
  });
});

// Start server
app.listen(port, () => {
  console.log(`\n✅ x402 server running at http://localhost:${port}`);
  console.log(`   Free:  GET /  |  GET /health`);
  console.log(`   Paid:  GET /api/agent-info ($0.001)  |  POST /api/agent-task ($0.01)  |  GET /api/premium/analysis ($0.005)`);
});
