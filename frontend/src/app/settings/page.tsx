'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { ProfilePhotoUpload } from '@/components/profile/ProfilePhotoUpload';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { UserProfileUpdateRequest } from '@/types';

interface ProfileFormData {
  full_name: string;
  email: string;
  username: string;
}

export default function SettingsPage() {
  const { user, updateUserProfile, isLoading } = useAuthStore();
  const { isPixelTheme } = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      username: user?.username || '',
    },
  });

  if (!user) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </SidebarLayout>
    );
  }

  const handleProfileUpdate = async (data: ProfileFormData) => {
    setIsUpdating(true);
    try {
      const updateData: UserProfileUpdateRequest = {
        full_name: data.full_name || undefined,
      };

      await updateUserProfile(updateData);
      toast.success('Profile updated successfully!');
      reset(data);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePhotoUpdate = async (photoUrl: string, ipfsHash: string) => {
    try {
      const updateData: UserProfileUpdateRequest = {
        profile_photo_url: photoUrl || undefined,
        profile_photo_ipfs_hash: ipfsHash || undefined,
      };

      await updateUserProfile(updateData);
    } catch (error) {
      console.error('Error updating profile photo:', error);
      toast.error('Failed to update profile photo');
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-4xl space-y-8">
        {/* Header */}
        <div className="border-b border-border-default pb-5 animate-fade-in-down">
          <h1 className={`text-2xl font-bold leading-6 text-text-primary ${isPixelTheme ? 'font-pixel text-lg pixel-text' : 'smooth-text'}`}>
            Account Settings
          </h1>
          <p className={`mt-2 max-w-4xl text-sm text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
            Manage your account information and preferences.
          </p>
        </div>

        {/* Theme Settings Section */}
        <div className="animate-fade-in-up">
          <ThemeSelector />
        </div>

        {/* Profile Photo Section */}
        <Card className="animate-fade-in-up animate-delay-100">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Profile Photo</h2>
            <p className="text-sm text-gray-500">
              Upload a custom profile photo to personalize your account.
            </p>
          </CardHeader>
          <CardContent>
            <ProfilePhotoUpload
              user={user}
              onPhotoUpdate={handlePhotoUpdate}
            />
          </CardContent>
        </Card>

        {/* Profile Information Section */}
        <Card className="animate-fade-in-up animate-delay-200">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
            <p className="text-sm text-gray-500">
              Update your personal information and display preferences.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleProfileUpdate)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="animate-slide-in-left animate-delay-300">
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="Enter your full name"
                    error={errors.full_name?.message}
                    {...register('full_name')}
                  />
                </div>

                <div className="animate-slide-in-right animate-delay-300">
                  <Input
                    label="Username"
                    type="text"
                    value={user.username}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Username cannot be changed
                  </p>
                </div>

                <div className="animate-slide-in-left animate-delay-400 sm:col-span-2">
                  <Input
                    label="Email Address"
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email address cannot be changed
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 animate-fade-in-up animate-delay-500">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={!isDirty || isUpdating}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={!isDirty || isUpdating}
                  className="hover-lift"
                >
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Status Section */}
        <Card className="animate-fade-in-up animate-delay-300">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Account Status</h2>
            <p className="text-sm text-gray-500">
              Information about your account status and verification.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-700">Account Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-700">Email Verification</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.is_verified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.is_verified ? 'Verified' : 'Pending'}
                </span>
              </div>

              {user.created_at && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-700">Member Since</span>
                  <span className="text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* IPFS Integration Info */}
        <Card className="border-blue-200 bg-blue-50 animate-fade-in-up animate-delay-400">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900">IPFS Integration</h3>
                <p className="mt-1 text-sm text-blue-700">
                  Your profile photos are stored securely on IPFS (InterPlanetary File System) 
                  for decentralized, permanent storage. This ensures your images are always 
                  accessible and not dependent on any single server.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}