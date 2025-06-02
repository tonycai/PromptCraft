'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/contexts/ThemeContext';

interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
}

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const { isPixelTheme } = useTheme();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.email, data.username, data.password, data.fullName);
      toast.success('Registration successful! Please sign in.');
      router.push('/auth/login');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className={`text-3xl font-bold text-text-primary mb-4 ${isPixelTheme ? 'font-pixel text-2xl pixel-text' : 'smooth-text'}`}>Create account</h2>
        <p className={`mt-2 text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className={`text-text-accent hover:text-text-primary font-medium transition-colors duration-200 ${isPixelTheme ? 'font-pixel pixel-text' : 'smooth-text'}`}
          >
            Sign in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            label="Full Name (Optional)"
            type="text"
            placeholder="Enter your full name"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
        </div>

        <div>
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />
        </div>

        <div>
          <Input
            label="Username"
            type="text"
            placeholder="Choose a username"
            error={errors.username?.message}
            {...register('username', {
              required: 'Username is required',
              minLength: {
                value: 3,
                message: 'Username must be at least 3 characters',
              },
            })}
          />
        </div>

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="Create a password"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
          />
        </div>

        <div>
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) =>
                value === password || 'Passwords do not match',
            })}
          />
        </div>

        <div>
          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
          >
            Create account
          </Button>
        </div>
      </form>
    </div>
  );
}