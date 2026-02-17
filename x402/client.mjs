/**
 * x402 Payment Client
 * 
 * Makes HTTP requests to x402-gated services, automatically handling
 * 402 Payment Required responses with USDC payments on Base.
 * 
 * Usage: 
 *   node x402/client.mjs <url> [--method POST] [--body '{"key":"val"}']
 *   node x402/client.mjs https://api.example.com/paid-endpoint
 *   node x402/client.mjs http://localhost:4021/api/agent-info
 * 
 * Environment:
 *   AGENT_WALLET_PRIVATE_KEY - private key for signing payments
 */

import { x402Client, wrapFetchWithPayment, x402HTTPClient } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";
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

// Parse args
const args = process.argv.slice(2);
const url = args.find(a => a.startsWith("http"));
const methodIdx = args.indexOf("--method");
const method = methodIdx !== -1 ? args[methodIdx + 1] : "GET";
const bodyIdx = args.indexOf("--body");
const body = bodyIdx !== -1 ? args[bodyIdx + 1] : undefined;
const maxPayIdx = args.indexOf("--max-payment");
const maxPayment = maxPayIdx !== -1 ? parseFloat(args[maxPayIdx + 1]) : 1.0;

if (!url) {
  console.error("Usage: node x402/client.mjs <url> [--method POST] [--body '{...}'] [--max-payment 1.0]");
  process.exit(1);
}

const privateKey = process.env.AGENT_WALLET_PRIVATE_KEY;
if (!privateKey) {
  console.error("❌ AGENT_WALLET_PRIVATE_KEY not set");
  process.exit(1);
}

// Create signer from private key
const signer = privateKeyToAccount(privateKey);
console.log(`📺 x402 Client`);
console.log(`   Wallet:  ${signer.address}`);
console.log(`   Target:  ${url}`);
console.log(`   Method:  ${method}`);
console.log(`   Max pay: $${maxPayment} USDC`);
console.log();

// Create x402 client and register EVM payment scheme
const client = new x402Client();
registerExactEvmScheme(client, { signer });

// Wrap fetch with automatic payment handling
const fetchWithPayment = wrapFetchWithPayment(fetch, client);

try {
  const fetchOpts = { method };
  if (body) {
    fetchOpts.body = body;
    fetchOpts.headers = { "Content-Type": "application/json" };
  }

  const response = await fetchWithPayment(url, fetchOpts);
  
  console.log(`Status: ${response.status} ${response.statusText}`);
  
  // Check for payment receipt
  const httpClient = new x402HTTPClient(client);
  try {
    const paymentResponse = httpClient.getPaymentSettleResponse(
      (name) => response.headers.get(name)
    );
    if (paymentResponse) {
      console.log(`💰 Payment settled:`, JSON.stringify(paymentResponse, null, 2));
    }
  } catch {}

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("json")) {
    const data = await response.json();
    console.log(`\nResponse:`);
    console.log(JSON.stringify(data, null, 2));
  } else {
    const text = await response.text();
    console.log(`\nResponse:\n${text}`);
  }
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  if (error.cause) console.error(`   Cause:`, error.cause);
  if (error.message.includes("insufficient")) {
    console.error("💸 Insufficient USDC balance for payment");
  }
  process.exit(1);
}
