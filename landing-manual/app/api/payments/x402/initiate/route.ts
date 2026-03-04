import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { walletAddress } = await req.json();
    
    // Generate session for download tracking
    const sessionId = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    
    // Return x402 standard payment requirements
    const requirements = {
      x402Version: 1,
      error: 'Payment Required',
      accepts: [{
        scheme: 'exact',
        network: 'base',
        maxAmountRequired: '39000000', // 39 USDC (6 decimals)
        payTo: process.env.X402_WALLET_ADDRESS || '0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78',
        asset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
        maxTimeoutSeconds: 7200, // 2 hours
        extra: {
          name: 'Agent 18608 Revenue Playbook',
          description: 'Payment for PDF download',
          version: '1',
        }
      }],
      sessionId,
      userWallet: walletAddress, // Track for verification
    };
    
    return NextResponse.json(requirements);
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
