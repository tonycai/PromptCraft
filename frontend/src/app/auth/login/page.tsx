'use client';

import { LoginForm } from '@/components/forms/LoginForm';
import { useTheme } from '@/contexts/ThemeContext';

export default function LoginPage() {
  const { isPixelTheme } = useTheme();
  
  return (
    <div className="min-h-screen bg-background-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className={`text-4xl font-bold text-text-accent mb-8 ${isPixelTheme ? 'font-pixel text-3xl pixel-text' : 'smooth-text'}`}>
            PromptCraft
          </h1>
        </div>
        
        <div className="bg-background-secondary py-8 px-4 shadow-lg border border-border-default sm:rounded-default sm:px-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}