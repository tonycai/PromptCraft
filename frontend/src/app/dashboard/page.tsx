'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { useTheme } from '@/contexts/ThemeContext';

interface InfoCard {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

interface StatCard {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { isPixelTheme } = useTheme();

  const infoCards: InfoCard[] = [
    {
      title: 'Practice Questions',
      description: 'Browse and attempt prompting challenges across different domains and difficulty levels.',
      href: '/questions',
      color: 'blue',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'My Submissions',
      description: 'View your submitted prompts and generated responses from AI models.',
      href: '/submissions',
      color: 'green',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      title: 'Evaluations',
      description: 'Review expert evaluations and feedback on your prompt submissions.',
      href: '/evaluations',
      color: 'purple',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'Analytics',
      description: 'Track your performance metrics and progress over time.',
      href: '/analytics',
      color: 'orange',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
    },
    {
      title: 'Leaderboard',
      description: 'See how you rank compared to other prompt crafters.',
      href: '/leaderboard',
      color: 'yellow',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      title: 'Settings',
      description: 'Customize your preferences and account settings.',
      href: '/settings',
      color: 'gray',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const stats: StatCard[] = [
    { label: 'Total Submissions', value: '24', change: '+12%', trend: 'up' },
    { label: 'Avg Score', value: '87.5', change: '+5.2%', trend: 'up' },
    { label: 'Questions Completed', value: '18', change: '+3', trend: 'up' },
    { label: 'Current Rank', value: '#42', change: '+7', trend: 'up' },
  ];

  return (
    <SidebarLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold text-text-primary mb-4 ${isPixelTheme ? 'font-pixel text-2xl pixel-text' : 'smooth-text'}`}>
          Welcome back, {user?.username || 'User'}!
        </h1>
        <p className={`mt-2 text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
          Ready to test your prompting skills? Here&apos;s your dashboard overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className={`bg-background-secondary rounded-default shadow-default p-6 border border-border-default transition-all duration-200 hover:shadow-lg hover:scale-105 ${isPixelTheme ? 'pixel-perfect' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>{stat.label}</p>
                    <p className={`text-2xl font-bold text-text-primary ${isPixelTheme ? 'font-pixel text-lg pixel-text' : 'smooth-text'}`}>{stat.value}</p>
                  </div>
                  <div className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-text-success' : stat.trend === 'down' ? 'text-text-error' : 'text-text-secondary'
                  } ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                    {stat.change}
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Info Cards Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {infoCards.map((card, index) => (
              <Link
                key={card.title}
                href={card.href}
                className={`group relative rounded-default p-6 bg-background-secondary shadow-default hover:shadow-lg transition-all duration-200 border border-border-default hover:border-border-strong hover:scale-105 ${isPixelTheme ? 'pixel-perfect' : ''}`}
              >
                <div>
                  <span className={`inline-flex p-3 rounded-default bg-background-accent text-text-accent border-2 border-border-accent transition-all duration-200 group-hover:scale-110 ${isPixelTheme ? 'pixel-perfect' : ''}`}>
                    {card.icon}
                  </span>
                </div>
                <div className="mt-6">
                  <h3 className={`text-lg font-medium text-text-primary group-hover:text-text-accent transition-colors ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>
                    {card.title}
                  </h3>
                  <p className={`mt-2 text-sm text-text-secondary line-clamp-3 ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                    {card.description}
                  </p>
                </div>
                <span className="pointer-events-none absolute top-6 right-6 text-text-muted group-hover:text-text-accent transition-all duration-300 group-hover:transform group-hover:translate-x-1">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
      </div>

      {/* Getting Started Section */}
      <div className={`bg-background-accent border border-border-accent rounded-default p-6 transition-all duration-200 hover:scale-105 ${isPixelTheme ? 'pixel-perfect' : ''}`}>
        <h2 className={`text-lg font-medium text-text-accent mb-2 ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>
          Getting Started
        </h2>
        <p className={`text-sm text-text-secondary mb-4 ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
          New to PromptCraft? Here&apos;s how to get the most out of the platform:
        </p>
        <ol className={`list-decimal list-inside space-y-2 text-sm text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
          <li>Browse the available questions and select one that interests you</li>
          <li>Craft a prompt that you think will generate the desired outcome</li>
          <li>Submit your prompt and review the AI-generated response</li>
          <li>Wait for expert evaluation and feedback to improve your skills</li>
        </ol>
      </div>
    </SidebarLayout>
  );
}