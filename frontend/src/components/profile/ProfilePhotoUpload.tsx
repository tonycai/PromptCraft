'use client';

import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { usePinata } from '@/hooks/usePinata';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types';

interface ProfilePhotoUploadProps {
  user: User;
  onPhotoUpdate: (photoUrl: string, ipfsHash: string) => void;
  className?: string;
}

export function ProfilePhotoUpload({ user, onPhotoUpdate, className }: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, getGatewayUrl } = usePinata();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error('Please select an image first');
      return;
    }

    setIsUploading(true);

    try {
      // Upload to IPFS via Pinata
      const ipfsHash = await uploadFile(file, `profile_photo_${user.id}_${Date.now()}`);
      
      if (ipfsHash) {
        const photoUrl = getGatewayUrl(ipfsHash);
        
        // Call the callback to update the user profile
        onPhotoUpdate(photoUrl, ipfsHash);
        
        toast.success('Profile photo updated successfully!');
      }
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      toast.error('Failed to upload profile photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentPhotoUrl = previewUrl || user.profile_photo_url;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-6">
        {/* Profile Photo Display */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
            {currentPhotoUrl ? (
              <img
                src={currentPhotoUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '';
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100">
                <span className="text-2xl font-bold text-blue-600">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>
          
          {/* Upload indicator */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Profile Photo</h3>
            <p className="text-sm text-gray-500">
              Upload a photo to personalize your profile. Max size: 5MB.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
              disabled={isUploading}
            >
              Choose Photo
            </Button>

            {previewUrl && (
              <>
                <Button
                  onClick={handleUpload}
                  size="sm"
                  disabled={isUploading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isUploading ? 'Uploading...' : 'Save Photo'}
                </Button>

                <Button
                  onClick={handleRemovePhoto}
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              </>
            )}

            {user.profile_photo_url && !previewUrl && (
              <Button
                onClick={() => onPhotoUpdate('', '')}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Remove Photo
              </Button>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* IPFS Info */}
      {user.profile_photo_ipfs_hash && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <p>Stored on IPFS: {user.profile_photo_ipfs_hash}</p>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Supported formats: JPG, PNG, GIF, WebP</p>
        <p>• Recommended size: 400x400 pixels or larger</p>
        <p>• Images are stored securely on IPFS</p>
      </div>
    </div>
  );
}