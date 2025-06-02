import { NextRequest, NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';

// Initialize Pinata SDK with server-side environment variables
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: 'gateway.pinata.cloud',
});

export async function POST(request: NextRequest) {
  try {
    // Check if required environment variables are present
    if (!process.env.PINATA_JWT) {
      console.error('PINATA_JWT environment variable is missing');
      return NextResponse.json(
        { error: 'Server configuration error: PINATA_JWT not configured' },
        { status: 500 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    console.log('Uploading file to Pinata:', {
      name: fileName || file.name,
      size: file.size,
      type: file.type,
    });

    // Upload to Pinata
    const upload = await pinata.upload.public
      .file(file)
      .name(fileName || file.name);

    console.log('File uploaded successfully:', {
      cid: upload.cid,
      name: upload.name,
      size: upload.size,
    });

    // Return the IPFS hash and gateway URL
    const ipfsHash = upload.cid;
    const gatewayUrl = `https://mypinata.moonpump.ai/ipfs/${ipfsHash}`;

    return NextResponse.json({
      success: true,
      ipfsHash,
      gatewayUrl,
      fileInfo: {
        name: upload.name,
        size: upload.size,
        mimeType: upload.mime_type,
        uploadedAt: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error('Error uploading file to IPFS:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to upload file to IPFS';
    let statusCode = 500;

    if (error.message?.includes('authentication')) {
      errorMessage = 'Authentication failed with Pinata service';
      statusCode = 401;
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = 'Network error connecting to Pinata service';
      statusCode = 503;
    } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
      errorMessage = 'Upload quota exceeded';
      statusCode = 429;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: statusCode }
    );
  }
}

// Handle GET requests for testing
export async function GET() {
  return NextResponse.json({
    message: 'IPFS Upload API endpoint',
    methods: ['POST'],
    maxFileSize: '5MB',
    allowedTypes: ['image/*'],
  });
}