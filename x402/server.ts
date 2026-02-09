#!/usr/bin/env tsx
/**
 * x402 Payment Server — Mr. Tee
 *
 * Follows the official Coinbase x402 Seller Quickstart:
 * https://docs.cdp.coinbase.com/x402/quickstart-for-sellers
 *
 * Facilitators:
 *   Testnet  → https://www.x402.org/facilitator  (Base Sepolia, no key)
 *   Mainnet  → https://api.cdp.coinbase.com/platform/v2/x402  (requires CDP API keys)
 */

import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { facilitator as cdpFacilitator, createCdpAuthHeaders } from "@coinbase/x402";
import dotenv from "dotenv";

dotenv.config({ path: "/home/phan_harry/.openclaw/.env" });

const app = express();
const PORT = parseInt(process.env.X402_PORT || "4021");

// ── Configuration ──────────────────────────────────────────────
// Testnet: Base Sepolia (eip155:84532) + free facilitator
// Mainnet: Base (eip155:8453) + CDP facilitator (needs API keys)
const USE_TESTNET = (process.env.X402_NETWORK || "testnet") !== "mainnet";

const network   = USE_TESTNET ? "eip155:84532" : "eip155:8453";
const label     = USE_TESTNET ? "Base Sepolia (testnet)" : "Base (mainnet)";
const facilitatorUrl = USE_TESTNET
  ? "https://www.x402.org/facilitator"
  : (process.env.X402_FACILITATOR_URL || "https://api.cdp.coinbase.com/platform/v2/x402");

// CDP auth headers for mainnet facilitator (JWT-based, per-endpoint)
const createAuthHeaders = !USE_TESTNET
  ? createCdpAuthHeaders(process.env.CDP_API_KEY_ID, process.env.CDP_API_KEY_SECRET)
  : undefined;

const payTo = "0xFdF53De20f46bAE2Fa6414e6F25EF1654E68Acd0";

console.log("📺 x402 Server starting…");
console.log(`Network:     ${label} (${network})`);
console.log(`Facilitator: ${facilitatorUrl}`);
console.log(`Pay to:      ${payTo}`);
console.log(`Port:        ${PORT}`);

// ── Facilitator + Resource Server ──────────────────────────────
const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl, createAuthHeaders });
const resourceServer = new x402ResourceServer(facilitatorClient)
  .register(network, new ExactEvmScheme());

// ── Payment Routes ─────────────────────────────────────────────
app.use(
  paymentMiddleware(
    {
      "GET /api/agent-info": {
        accepts: [{ scheme: "exact", price: "$0.001", network, payTo }],
        description: "Agent identity and capabilities",
        mimeType: "application/json",
      },
      "POST /api/agent-task": {
        accepts: [{ scheme: "exact", price: "$0.01", network, payTo }],
        description: "Execute an agent task",
        mimeType: "application/json",
      },
      "GET /api/premium/analysis": {
        accepts: [{ scheme: "exact", price: "$0.005", network, payTo }],
        description: "Premium market analysis",
        mimeType: "application/json",
      },
    },
    resourceServer,
  ),
);

app.use(express.json());

// ── Free Endpoints ─────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    name: "Mr. Tee x402 Agent",
    emoji: "📺",
    network,
    label,
    payTo,
    endpoints: {
      free: ["GET /", "GET /health"],
      paid: [
        "GET  /api/agent-info      ($0.001 USDC)",
        "POST /api/agent-task      ($0.01  USDC)",
        "GET  /api/premium/analysis ($0.005 USDC)",
      ],
    },
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", network, timestamp: new Date().toISOString() });
});

// ── Paid Endpoints (behind paymentMiddleware) ──────────────────
app.get("/api/agent-info", (_req, res) => {
  res.json({
    agentId: "8f7712b7-c4a8-4dc7-b614-0b958d561891",
    name: "Mr. Tee",
    emoji: "📺",
    description: "CRT monitor-headed AI agent building on Base",
    capabilities: ["Base ops", "zkBasecred", "Social coordination", "Autonomous workflows"],
    social: { twitter: "@mr_crtee", farcaster: "@mr-teeclaw", github: "teeclaw" },
    onchain: { network, wallet: payTo, a2a: "https://a2a.teeclaw.xyz/a2a" },
  });
});

app.post("/api/agent-task", (req, res) => {
  const { task, parameters } = req.body || {};
  if (!task) return res.status(400).json({ error: "Missing task" });
  res.json({
    taskId: `task_${Date.now()}`,
    task,
    parameters,
    status: "completed",
    result: `Task "${task}" executed successfully`,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/premium/analysis", (_req, res) => {
  res.json({
    analysis: {
      market: "bullish",
      confidence: 0.87,
      signals: ["volume_increase", "positive_sentiment", "momentum_shift"],
      recommendation: "Consider accumulation on dips",
      timestamp: new Date().toISOString(),
    },
    metadata: { dataSource: "aggregated_feeds", modelVersion: "v2.1", cost: "$0.005 USDC" },
  });
});

// ── Start ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ x402 server live → http://localhost:${PORT}`);
  console.log(`Free:  GET / | GET /health`);
  console.log(`Paid:  GET /api/agent-info ($0.001) | POST /api/agent-task ($0.01) | GET /api/premium/analysis ($0.005)\n`);
});
