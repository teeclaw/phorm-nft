import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();
    
    if (!address) {
      return NextResponse.json({ 
        error: 'Wallet address required',
      }, { status: 400 });
    }
    
    // Price: $39 in USDC (6 decimals)
    const amount = '39000000'; // 39 USDC
    
    // Create payment session
    const sessionId = `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    // TODO: Store session in database/cache with:
    // - sessionId
    // - buyer address
    // - amount
    // - timestamp
    // - status: 'pending'
    
    return NextResponse.json({
      success: true,
      sessionId,
      amount,
      currency: 'USDC',
      network: 'base',
      recipient: process.env.PAYMENT_WALLET_ADDRESS || '0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78',
    });
    
  } catch (error) {
    console.error('x402 initiate error:', error);
    return NextResponse.json({ 
      error: 'Payment initiation failed',
    }, { status: 500 });
  }
}
