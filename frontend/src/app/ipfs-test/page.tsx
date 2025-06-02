'use client';

import { useState } from 'react';
import { usePinata } from '@/hooks/usePinata';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useTheme } from '@/contexts/ThemeContext';

export default function IPFSTestPage() {
  const { uploadFile, retrieveData, getGatewayUrl, validateFile, loading, error } = usePinata();
  const { isPixelTheme } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedHash, setUploadedHash] = useState<string>('');
  const [retrievedData, setRetrievedData] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; error?: string } | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const validation = validateFile(file);
      setValidationResult(validation);
    } else {
      setSelectedFile(null);
      setValidationResult(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    const hash = await uploadFile(selectedFile, `test_upload_${Date.now()}`);
    if (hash) {
      setUploadedHash(hash);
    }
  };

  const handleRetrieveData = async () => {
    if (!uploadedHash) return;
    
    const data = await retrieveData(uploadedHash);
    if (data) {
      setRetrievedData(data);
    }
  };

  return (
    <div className="min-h-screen bg-background-primary p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold text-text-primary mb-4 ${isPixelTheme ? 'font-pixel text-2xl pixel-text' : 'smooth-text'}`}>
            IPFS Upload Test
          </h1>
          <p className={`text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
            Test the IPFS integration with Pinata
          </p>
        </div>
        
        {/* File Upload Test */}
        <Card className="bg-background-primary border-border-default">
          <CardHeader>
            <h2 className={`text-xl font-semibold text-text-primary ${isPixelTheme ? 'font-pixel text-lg pixel-text' : 'smooth-text'}`}>
              Image Upload Test
            </h2>
            <p className={`text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
              Select an image file to upload to IPFS
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className={`block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-default file:border-0 file:text-sm file:font-semibold file:bg-background-accent file:text-text-accent hover:file:bg-background-secondary ${isPixelTheme ? 'font-pixel pixel-text' : 'smooth-text'}`}
              />
            </div>
            
            {/* File Validation */}
            {validationResult && (
              <div className={`p-3 rounded-default border ${
                validationResult.valid 
                  ? 'bg-background-success border-border-success' 
                  : 'bg-background-error border-border-error'
              }`}>
                <p className={`text-sm ${
                  validationResult.valid 
                    ? 'text-text-success' 
                    : 'text-text-error'
                } ${isPixelTheme ? 'font-pixel pixel-text' : 'smooth-text'}`}>
                  {validationResult.valid ? '✓ File is valid for upload' : `✗ ${validationResult.error}`}
                </p>
              </div>
            )}
            
            {/* Selected File Info */}
            {selectedFile && (
              <div className="p-3 bg-background-secondary border border-border-subtle rounded-default">
                <h3 className={`font-medium text-text-primary mb-2 ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>
                  Selected File:
                </h3>
                <div className={`text-sm text-text-secondary space-y-1 ${isPixelTheme ? 'font-pixel pixel-text' : 'smooth-text'}`}>
                  <p><strong>Name:</strong> {selectedFile.name}</p>
                  <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <p><strong>Type:</strong> {selectedFile.type}</p>
                </div>
              </div>
            )}
            
            <Button 
              onClick={handleFileUpload} 
              disabled={!selectedFile || !validationResult?.valid || loading}
              className="w-full"
            >
              {loading ? 'Uploading...' : 'Upload to IPFS'}
            </Button>
          </CardContent>
        </Card>

        {/* Upload Result */}
        {uploadedHash && (
          <Card className="bg-background-primary border-border-default">
            <CardHeader>
              <h2 className={`text-xl font-semibold text-text-primary ${isPixelTheme ? 'font-pixel text-lg pixel-text' : 'smooth-text'}`}>
                Upload Successful!
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-background-success border border-border-success rounded-default">
                <p className={`text-text-success ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                  <strong>IPFS Hash:</strong> {uploadedHash}
                </p>
              </div>
              
              <div className="p-3 bg-background-secondary border border-border-subtle rounded-default">
                <p className={`text-text-secondary text-sm ${isPixelTheme ? 'font-pixel pixel-text' : 'smooth-text'}`}>
                  <strong>Gateway URL:</strong>
                </p>
                <a 
                  href={getGatewayUrl(uploadedHash)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`text-text-accent hover:text-text-primary underline break-all ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}
                >
                  {getGatewayUrl(uploadedHash)}
                </a>
              </div>
              
              {/* Display uploaded image */}
              {selectedFile?.type.startsWith('image/') && (
                <div className="p-3 bg-background-secondary border border-border-subtle rounded-default">
                  <p className={`text-text-secondary text-sm mb-2 ${isPixelTheme ? 'font-pixel pixel-text' : 'smooth-text'}`}>
                    <strong>Uploaded Image:</strong>
                  </p>
                  <img 
                    src={getGatewayUrl(uploadedHash)} 
                    alt="Uploaded to IPFS"
                    className={`max-w-full h-auto rounded-default border border-border-subtle ${isPixelTheme ? 'pixel-perfect' : ''}`}
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Data Retrieval Test */}
        <Card className="bg-background-primary border-border-default">
          <CardHeader>
            <h2 className={`text-xl font-semibold text-text-primary ${isPixelTheme ? 'font-pixel text-lg pixel-text' : 'smooth-text'}`}>
              Data Retrieval Test
            </h2>
            <p className={`text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
              Retrieve data from IPFS using hash
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <input
                type="text"
                value={uploadedHash}
                onChange={(e) => setUploadedHash(e.target.value)}
                placeholder="Enter IPFS hash"
                className={`w-full px-3 py-2 border border-border-default rounded-default bg-background-secondary text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-interactive-primary ${isPixelTheme ? 'font-pixel text-xs pixel-text pixel-perfect' : 'smooth-text'}`}
              />
            </div>
            <Button 
              onClick={handleRetrieveData} 
              disabled={!uploadedHash || loading}
              className="w-full"
            >
              {loading ? 'Retrieving...' : 'Retrieve Data from IPFS'}
            </Button>
            
            {retrievedData && (
              <div className="p-3 bg-background-secondary border border-border-subtle rounded-default">
                <h3 className={`font-medium text-text-primary mb-2 ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>
                  Retrieved Data:
                </h3>
                <pre className={`text-sm overflow-x-auto text-text-secondary ${isPixelTheme ? 'font-pixel pixel-text' : 'smooth-text'}`}>
                  {typeof retrievedData === 'string' ? retrievedData : JSON.stringify(retrievedData, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="bg-background-error border-border-error">
            <CardContent className="pt-6">
              <p className={`text-text-error ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                <strong>Error:</strong> {error}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-background-accent border-border-accent">
          <CardHeader>
            <h2 className={`text-xl font-semibold text-text-accent ${isPixelTheme ? 'font-pixel text-lg pixel-text' : 'smooth-text'}`}>
              How to Test
            </h2>
          </CardHeader>
          <CardContent>
            <ol className={`list-decimal list-inside space-y-2 text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
              <li>Select an image file (JPG, PNG, GIF, WebP) under 5MB</li>
              <li>Click &quot;Upload to IPFS&quot; to upload the file</li>
              <li>Once uploaded, the IPFS hash and gateway URL will appear</li>
              <li>Click the gateway URL to view your file directly from IPFS</li>
              <li>You can also test retrieval by entering any IPFS hash</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}