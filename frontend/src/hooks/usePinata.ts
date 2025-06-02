import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  uploadToPinata,
  retrieveFromPinata,
  validateFileForUpload,
  getIPFSGatewayUrl,
} from '@/lib/pinata';

export function usePinata() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, name?: string): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate file before upload
      const validation = validateFileForUpload(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      const ipfsHash = await uploadToPinata(file, name);
      
      toast.success('File uploaded to IPFS successfully!');
      return ipfsHash;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload file';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const retrieveData = async (ipfsHash: string): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await retrieveFromPinata(ipfsHash);
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to retrieve data';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getGatewayUrl = (ipfsHash: string): string => {
    return getIPFSGatewayUrl(ipfsHash);
  };

  return {
    loading,
    error,
    uploadFile,
    retrieveData,
    getGatewayUrl,
    validateFile: validateFileForUpload,
  };
}