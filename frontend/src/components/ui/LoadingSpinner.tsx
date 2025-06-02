import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const colorClasses = {
  primary: 'text-blue-600',
  white: 'text-white',
  gray: 'text-gray-600',
};

export function LoadingSpinner({ size = 'md', color = 'primary', className }: LoadingSpinnerProps) {
  return (
    <div className={clsx('animate-spin', sizeClasses[size], colorClasses[color], className)}>
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={clsx('flex space-x-1', className)}>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce animate-delay-100"></div>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce animate-delay-200"></div>
    </div>
  );
}

export function LoadingPulse({ className }: { className?: string }) {
  return (
    <div className={clsx('inline-block animate-pulse-subtle', className)}>
      <div className="w-8 h-8 bg-blue-600 rounded-full animate-ping"></div>
    </div>
  );
}