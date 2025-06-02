'use client';

import { getIPFSGatewayUrl } from '@/lib/pinata';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useTheme } from '@/contexts/ThemeContext';

export default function GatewayTestPage() {
  const { isPixelTheme } = useTheme();
  
  // Test with your provided IPFS hash
  const testHash = 'bafybeihg4bkata5lrgpyzhlwgaaw5ucxewrinpimnhhy5mgzrfudsgmbnu';
  const expectedUrl = 'https://mypinata.moonpump.ai/ipfs/bafybeihg4bkata5lrgpyzhlwgaaw5ucxewrinpimnhhy5mgzrfudsgmbnu';
  const generatedUrl = getIPFSGatewayUrl(testHash);
  const urlsMatch = generatedUrl === expectedUrl;

  return (
    <div className="min-h-screen bg-background-primary p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold text-text-primary mb-4 ${isPixelTheme ? 'font-pixel text-2xl pixel-text' : 'smooth-text'}`}>
            Gateway URL Test
          </h1>
          <p className={`text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
            Verify that the gateway URL generation is working correctly
          </p>
        </div>

        <Card className="bg-background-primary border-border-default">
          <CardHeader>
            <h2 className={`text-xl font-semibold text-text-primary ${isPixelTheme ? 'font-pixel text-lg pixel-text' : 'smooth-text'}`}>
              Gateway URL Configuration Test
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-background-secondary border border-border-subtle rounded-default">
                <h3 className={`font-medium text-text-primary mb-2 ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>
                  Test IPFS Hash:
                </h3>
                <code className={`text-text-accent bg-background-accent px-2 py-1 rounded break-all ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'font-mono'}`}>
                  {testHash}
                </code>
              </div>

              <div className="p-4 bg-background-secondary border border-border-subtle rounded-default">
                <h3 className={`font-medium text-text-primary mb-2 ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>
                  Expected URL:
                </h3>
                <div className={`text-text-secondary break-all ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'font-mono text-sm'}`}>
                  {expectedUrl}
                </div>
              </div>

              <div className="p-4 bg-background-secondary border border-border-subtle rounded-default">
                <h3 className={`font-medium text-text-primary mb-2 ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>
                  Generated URL:
                </h3>
                <div className={`text-text-secondary break-all ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'font-mono text-sm'}`}>
                  {generatedUrl}
                </div>
              </div>

              <div className={`p-4 rounded-default border ${
                urlsMatch 
                  ? 'bg-background-success border-border-success' 
                  : 'bg-background-error border-border-error'
              }`}>
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl ${urlsMatch ? 'text-text-success' : 'text-text-error'}`}>
                    {urlsMatch ? '✅' : '❌'}
                  </span>
                  <div>
                    <h3 className={`font-medium ${urlsMatch ? 'text-text-success' : 'text-text-error'} ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>
                      {urlsMatch ? 'URL Generation Successful!' : 'URL Generation Failed!'}
                    </h3>
                    <p className={`text-sm ${urlsMatch ? 'text-text-success' : 'text-text-error'} ${isPixelTheme ? 'font-pixel pixel-text' : 'smooth-text'}`}>
                      {urlsMatch 
                        ? 'The gateway URL is correctly configured to use your custom domain.' 
                        : 'The generated URL does not match the expected URL.'}
                    </p>
                  </div>
                </div>
              </div>

              {urlsMatch && (
                <div className="p-4 bg-background-accent border border-border-accent rounded-default">
                  <h3 className={`font-medium text-text-accent mb-2 ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>
                    Test the URL:
                  </h3>
                  <a 
                    href={generatedUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`text-text-accent hover:text-text-primary underline break-all ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}
                  >
                    Click here to test the IPFS gateway URL
                  </a>
                  <p className={`text-text-secondary text-sm mt-2 ${isPixelTheme ? 'font-pixel pixel-text' : 'smooth-text'}`}>
                    This should open the file directly from your custom IPFS gateway.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background-primary border-border-default">
          <CardHeader>
            <h2 className={`text-xl font-semibold text-text-primary ${isPixelTheme ? 'font-pixel text-lg pixel-text' : 'smooth-text'}`}>
              Configuration Summary
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                <span className={`text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                  Pinata SDK Gateway:
                </span>
                <code className={`text-text-primary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'font-mono text-sm'}`}>
                  gateway.pinata.cloud
                </code>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                <span className={`text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                  Display Gateway:
                </span>
                <code className={`text-text-primary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'font-mono text-sm'}`}>
                  mypinata.moonpump.ai
                </code>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className={`text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                  Status:
                </span>
                <span className={`${urlsMatch ? 'text-text-success' : 'text-text-error'} ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                  {urlsMatch ? 'Correctly Configured' : 'Configuration Error'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}