import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify Gumroad webhook signature (if configured)
    // const signature = request.headers.get('x-gumroad-signature');
    
    console.log('Gumroad webhook received:', body);
    
    // Handle successful purchase
    if (body.sale) {
      const { email, full_name, product_id, sale_id } = body.sale;
      
      // TODO: Generate signed download URL
      // TODO: Send email with download link
      // TODO: Log purchase in database/analytics
      
      console.log('Purchase confirmed:', {
        email,
        name: full_name,
        product: product_id,
        sale: sale_id,
      });
      
      return NextResponse.json({ 
        success: true,
        message: 'Purchase processed',
      });
    }
    
    return NextResponse.json({ 
      success: false,
      message: 'Invalid webhook data',
    }, { status: 400 });
    
  } catch (error) {
    console.error('Gumroad webhook error:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Webhook processing failed',
    }, { status: 500 });
  }
}
