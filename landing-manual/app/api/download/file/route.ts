import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

function verifySignature(purchaseId: string, expiresAt: string, signature: string): boolean {
  const secret = process.env.DOWNLOAD_SECRET || 'change-me-in-production';
  const data = `${purchaseId}:${expiresAt}`;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
  
  return signature === expectedSignature;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const purchaseId = searchParams.get('id');
    const expiresAt = searchParams.get('expires');
    const signature = searchParams.get('sig');
    
    if (!purchaseId || !expiresAt || !signature) {
      return NextResponse.json({ 
        error: 'Invalid download URL',
      }, { status: 400 });
    }
    
    // Check expiration
    const expiryTime = parseInt(expiresAt);
    if (Date.now() > expiryTime) {
      return NextResponse.json({ 
        error: 'Download link expired',
      }, { status: 403 });
    }
    
    // Verify signature
    if (!verifySignature(purchaseId, expiresAt, signature)) {
      return NextResponse.json({ 
        error: 'Invalid signature',
      }, { status: 403 });
    }
    
    // TODO: Log download
    console.log('Download requested:', { purchaseId, timestamp: new Date().toISOString() });
    
    // Serve the PDF file
    const pdfPath = path.join(process.cwd(), 'public', 'agent-operations-manual.pdf');
    
    try {
      const fileBuffer = await fs.readFile(pdfPath);
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="agent-operations-manual.pdf"',
          'Cache-Control': 'private, no-cache',
        },
      });
    } catch (fileError) {
      console.error('PDF file not found:', pdfPath);
      return NextResponse.json({ 
        error: 'PDF file not ready. Please contact support.',
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ 
      error: 'Download failed',
    }, { status: 500 });
  }
}
