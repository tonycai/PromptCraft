'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';

interface LoginFormData {
  username: string;
  password: string;
}

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.username, data.password);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Sign in</h2>
        <p className="mt-2 text-gray-600">
          Don't have an account?{' '}
          <Link
            href="/auth/register"
            className="text-primary-600 hover:text-primary-500 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Username or Email"
          type="text"
          placeholder="Enter your username or email"
          error={errors.username?.message}
          {...register('username', {
            required: 'Username or email is required',
          })}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
          })}
        />

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
        >
          Sign in
        </Button>
      </form>

      <div className="text-center">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-primary-600 hover:text-primary-500"
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  );
}