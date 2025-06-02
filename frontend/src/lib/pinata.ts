// Pinata configuration and utilities
export const PINATA_CONFIG = {
  gateway: 'https://mypinata.moonpump.ai',
} as const;

// Upload file to IPFS via our API route
export async function uploadToPinata(file: File, name?: string): Promise<string> {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    if (name) {
      formData.append('fileName', name);
    }

    // Upload via our API route
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      console.error('Upload API error:', errorMessage);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    if (!result.success || !result.ipfsHash) {
      throw new Error('Invalid response from upload API');
    }

    console.log('File uploaded successfully:', {
      ipfsHash: result.ipfsHash,
      gatewayUrl: result.gatewayUrl,
    });

    return result.ipfsHash;
  } catch (error: any) {
    console.error('Error uploading to IPFS:', error);
    
    // Provide user-friendly error messages
    if (error.message?.includes('authentication')) {
      throw new Error('Authentication failed. Please try again later.');
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
      throw new Error('Upload quota exceeded. Please try a smaller file.');
    } else if (error.message?.includes('size')) {
      throw new Error('File size must be less than 5MB.');
    } else if (error.message?.includes('type') || error.message?.includes('image')) {
      throw new Error('Only image files are allowed.');
    } else {
      throw new Error(error.message || 'Failed to upload file to IPFS');
    }
  }
}

// Retrieve data from IPFS via gateway
export async function retrieveFromPinata(ipfsHash: string): Promise<any> {
  try {
    const response = await fetch(`${PINATA_CONFIG.gateway}/ipfs/${ipfsHash}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    throw new Error('Failed to retrieve data from IPFS');
  }
}

// Get gateway URL for an IPFS hash
export function getIPFSGatewayUrl(ipfsHash: string): string {
  return `${PINATA_CONFIG.gateway}/ipfs/${ipfsHash}`;
}

// Validate file for IPFS upload
export function validateFileForUpload(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Only image files are allowed' };
  }

  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  return { valid: true };
}