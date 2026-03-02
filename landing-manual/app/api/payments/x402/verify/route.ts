import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, txHash } = await request.json();
    
    if (!sessionId || !txHash) {
      return NextResponse.json({ 
        error: 'Session ID and transaction hash required',
      }, { status: 400 });
    }
    
    // TODO: Verify transaction on Base
    // - Check tx exists and is confirmed
    // - Verify amount is correct (39 USDC)
    // - Verify recipient is correct
    // - Update session status to 'confirmed'
    
    // For now, return mock verification
    // In production, use Base RPC to verify the transaction
    
    const isValid = true; // TODO: Replace with actual verification
    
    if (isValid) {
      // TODO: Generate signed download URL
      // TODO: Send email with download link
      
      return NextResponse.json({
        success: true,
        verified: true,
        downloadUrl: '/api/download/generate', // TODO: Generate actual URL
      });
    }
    
    return NextResponse.json({
      success: false,
      verified: false,
      message: 'Payment verification failed',
    }, { status: 400 });
    
  } catch (error) {
    console.error('x402 verify error:', error);
    return NextResponse.json({ 
      error: 'Verification failed',
    }, { status: 500 });
  }
}
