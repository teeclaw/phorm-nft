/**
 * x402-verify.ts — onchain.fi payment verification
 * Extracted from workspace/x402/x402-server.js for Next.js
 */

const ONCHAIN_API = 'https://api.onchain.fi';

interface VerificationResult {
  verified: boolean;
  txHash?: string;
  facilitator?: string;
  amount?: string;
  error?: string;
}

interface PaymentRequirements {
  amount: string;
  token: string;
  network: string;
  recipient: string;
}

/**
 * Verify payment with onchain.fi aggregator
 * Uses the x402 protocol standard via onchain.fi /v1/pay endpoint
 */
export async function verifyPaymentWithOnchain(
  paymentProof: any,
  requirements: PaymentRequirements
): Promise<VerificationResult> {
  try {
    const apiKey = process.env.ONCHAIN_API_KEY;
    
    if (!apiKey) {
      return {
        verified: false,
        error: 'ONCHAIN_API_KEY not configured'
      };
    }

    // Convert amount to USDC units (6 decimals)
    const amountInUnits = String(Math.round(parseFloat(requirements.amount) * 1e6));

    // Handle both payment proof formats:
    // 1. x402 payment header (base64 encoded)
    // 2. Simple tx hash object { txHash: '0x...' }
    const paymentHeader = typeof paymentProof === 'string' 
      ? paymentProof 
      : paymentProof?.txHash;

    if (!paymentHeader) {
      return {
        verified: false,
        error: 'No payment proof or transaction hash provided'
      };
    }

    // Call onchain.fi verification endpoint
    const response = await fetch(`${ONCHAIN_API}/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        paymentHeader,
        to: requirements.recipient,
        sourceNetwork: requirements.network,
        destinationNetwork: requirements.network,
        expectedAmount: requirements.amount, // Human-readable e.g. "39.00"
        expectedToken: requirements.token,
        priority: 'balanced',
      }),
    });

    const data = await response.json();

    // Check if payment was successfully verified and settled
    if (response.status === 200 && data?.data?.settled) {
      return {
        verified: true,
        txHash: data.data.txHash,
        facilitator: data.data.facilitator,
        amount: data.data.amount,
      };
    }

    // Payment not verified
    return {
      verified: false,
      error: data?.error || data?.message || `Verification failed (status ${response.status})`,
    };

  } catch (error) {
    console.error('[x402-verify] Error:', error);
    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Verification failed'
    };
  }
}

/**
 * Build x402 standard payment requirements response
 * Format follows x402 v1 spec
 */
export function buildPaymentRequirements(opts: {
  amount: string;
  recipient: string;
  description?: string;
  sourceNetwork?: string;
  destinationNetwork?: string;
}) {
  const network = opts.sourceNetwork || 'base';
  const amountUnits = String(Math.round(parseFloat(opts.amount) * 1e6)); // USDC 6 decimals

  return {
    x402Version: 1,
    error: 'Payment Required',
    accepts: [
      {
        scheme: 'exact',
        network,
        maxAmountRequired: amountUnits,
        payTo: opts.recipient,
        asset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
        maxTimeoutSeconds: 7200, // 2 hours
        extra: {
          name: 'USD Coin',
          version: '2',
          description: opts.description || 'x402 payment required',
        },
      },
    ],
  };
}
