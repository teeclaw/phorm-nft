import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Generate a signed download URL that expires in 24 hours
function generateSignedUrl(purchaseId: string): string {
  const secret = process.env.DOWNLOAD_SECRET || 'change-me-in-production';
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  const data = `${purchaseId}:${expiresAt}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
  
  return `/api/download/file?id=${purchaseId}&expires=${expiresAt}&sig=${signature}`;
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, email } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ 
        error: 'Session ID required',
      }, { status: 400 });
    }
    
    // TODO: Verify session is paid
    // TODO: Log download URL generation
    
    const downloadUrl = generateSignedUrl(sessionId);
    
    // TODO: Send email with download link
    
    return NextResponse.json({
      success: true,
      downloadUrl,
      expiresIn: '24 hours',
    });
    
  } catch (error) {
    console.error('Download generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate download URL',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const purchaseId = searchParams.get('id');
  
  if (!purchaseId) {
    return NextResponse.json({ 
      error: 'Purchase ID required',
    }, { status: 400 });
  }
  
  const downloadUrl = generateSignedUrl(purchaseId);
  
  return NextResponse.json({
    downloadUrl,
    expiresIn: '24 hours',
  });
}
