'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/contexts/ThemeContext';

interface LoginFormData {
  username: string;
  password: string;
}

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const { isPixelTheme } = useTheme();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('🔐 Login attempt started for:', data.username);
      await login(data.username, data.password);
      console.log('✅ Login successful, redirecting to dashboard');
      toast.success('Login successful!');
      
      // Add small delay to ensure auth state is updated
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      // Better error handling
      let errorMessage = 'Login failed';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
      console.log('🔍 Full error details:', {
        response: error.response,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className={`text-3xl font-bold text-text-primary mb-4 ${isPixelTheme ? 'font-pixel text-2xl pixel-text' : 'smooth-text'}`}>Sign in</h2>
        <p className={`mt-2 text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/register"
            className={`text-text-accent hover:text-text-primary font-medium transition-colors duration-200 ${isPixelTheme ? 'font-pixel pixel-text' : 'smooth-text'}`}
          >
            Sign up
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            label="Username or Email"
            type="text"
            placeholder="Enter your username or email"
            error={errors.username?.message}
            {...register('username', {
              required: 'Username or email is required',
            })}
          />
        </div>

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
            })}
          />
        </div>

        <div>
          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
          >
            Sign in
          </Button>
        </div>
      </form>

      <div className="text-center">
        <Link
          href="/auth/forgot-password"
          className={`text-sm text-text-accent hover:text-text-primary transition-colors duration-200 ${isPixelTheme ? 'font-pixel pixel-text' : 'smooth-text'}`}
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  );
}