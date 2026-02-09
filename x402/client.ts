#!/usr/bin/env tsx
/**
 * x402 Payment Client — Mr. Tee
 *
 * Follows the official Coinbase x402 Buyer Quickstart:
 * https://docs.cdp.coinbase.com/x402/quickstart-for-buyers
 */

import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config({ path: "/home/phan_harry/.openclaw/.env" });

const WALLET_KEY = process.env.WALLET_PRIVATE_KEY;
if (!WALLET_KEY) {
  console.error("❌ Missing WALLET_PRIVATE_KEY in .env");
  process.exit(1);
}

// Create viem signer
const signer = privateKeyToAccount(WALLET_KEY as `0x${string}`);

// Create x402 client and register EVM scheme
const client = new x402Client();
registerExactEvmScheme(client, { signer });

// Wrap fetch with automatic payment handling
const paidFetch = wrapFetchWithPayment(fetch, client);

console.log("📺 x402 Client");
console.log(`Wallet: ${signer.address}\n`);

// ── Helpers ────────────────────────────────────────────────────
async function request(url: string, opts: RequestInit = {}) {
  console.log(`🔍 ${opts.method || "GET"} ${url}`);
  const res = await paidFetch(url, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const data = await res.json();
  console.log("✅ Success");
  return data;
}

async function demo(base: string) {
  console.log("=".repeat(60));

  // Free
  console.log("\n📡 Free: GET /");
  console.log(JSON.stringify(await request(base), null, 2));

  // Paid
  console.log("\n💰 Paid: GET /api/agent-info ($0.001)");
  console.log(JSON.stringify(await request(`${base}/api/agent-info`), null, 2));

  console.log("\n💰 Paid: POST /api/agent-task ($0.01)");
  console.log(
    JSON.stringify(
      await request(`${base}/api/agent-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "analyze_onchain", parameters: { network: "base", timeframe: "24h" } }),
      }),
      null,
      2,
    ),
  );

  console.log("\n💰 Paid: GET /api/premium/analysis ($0.005)");
  console.log(JSON.stringify(await request(`${base}/api/premium/analysis`), null, 2));

  console.log("\n" + "=".repeat(60));
  console.log("✅ All requests completed!");
}

// ── CLI ────────────────────────────────────────────────────────
const target = process.argv[2];
if (!target) {
  console.log("Usage:\n  npm run x402:client <url>\n\nExamples:");
  console.log("  npm run x402:client http://localhost:4021");
  console.log("  npm run x402:client http://localhost:4021/api/agent-info");
  process.exit(0);
}

if (target.includes("/api/")) {
  request(target)
    .then((d) => console.log("\n" + JSON.stringify(d, null, 2)))
    .catch((e) => { console.error("❌", e.message); process.exit(1); });
} else {
  demo(target).catch((e) => { console.error("❌ Demo failed:", e.message); process.exit(1); });
}
