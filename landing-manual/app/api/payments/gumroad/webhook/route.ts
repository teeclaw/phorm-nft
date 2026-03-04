import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Gumroad webhook received:', body);
    
    // Verify seller_id matches environment variable
    if (body.seller_id !== process.env.GUMROAD_SELLER_ID) {
      console.error('Invalid seller_id:', body.seller_id);
      return NextResponse.json({ 
        error: 'Invalid seller',
      }, { status: 401 });
    }
    
    // Extract buyer info
    const { email, sale_id, product_name } = body;
    
    console.log('Gumroad purchase confirmed:', { 
      email, 
      sale_id, 
      product_name,
    });
    
    // TODO: Generate signed download URL
    // TODO: Send email with download link via Resend
    // TODO: Log purchase in database/analytics
    
    return NextResponse.json({ 
      success: true,
      message: 'Purchase processed',
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ 
      error: 'Webhook failed',
    }, { status: 500 });
  }
}
