'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import { CompactThemeSelector } from '@/components/theme/ThemeSelector';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

interface SidebarItem {
  name: string;
  href: string;
  icon: string;
  active?: boolean;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, token, getCurrentUser } = useAuthStore();
  const { isPixelTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Start collapsed on mobile

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const sidebarItems: SidebarItem[] = [
    { 
      name: 'Overview', 
      href: '/dashboard', 
      icon: '📊', 
      active: pathname === '/dashboard' 
    },
    { 
      name: 'Questions', 
      href: '/questions', 
      icon: '❓', 
      active: pathname.startsWith('/questions') 
    },
    { 
      name: 'Submissions', 
      href: '/submissions', 
      icon: '📝', 
      active: pathname.startsWith('/submissions') 
    },
    { 
      name: 'Evaluations', 
      href: '/evaluations', 
      icon: '🎯', 
      active: pathname.startsWith('/evaluations') 
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: '📈', 
      active: pathname.startsWith('/analytics') 
    },
    { 
      name: 'Leaderboard', 
      href: '/leaderboard', 
      icon: '🏆', 
      active: pathname.startsWith('/leaderboard') 
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: '⚙️', 
      active: pathname.startsWith('/settings') 
    },
  ];

  // Authentication check
  useEffect(() => {
    const initAuth = async () => {
      console.log('🔒 SidebarLayout: Checking authentication...');
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        console.log('⚠️ SidebarLayout: No access token found, redirecting to login');
        router.push('/auth/login');
        return;
      }

      if (!user) {
        console.log('👤 SidebarLayout: No user data, fetching from API...');
        try {
          await getCurrentUser();
          console.log('✅ SidebarLayout: User data loaded successfully');
        } catch (error) {
          console.error('❌ SidebarLayout: Failed to get user data, redirecting to login:', error);
          router.push('/auth/login');
        }
      } else {
        console.log('✅ SidebarLayout: User already authenticated:', user.username);
      }
    };

    initAuth();
  }, [user, token, getCurrentUser, router]);

  if (!user || !token) {
    console.log('⏳ SidebarLayout: Showing loading state - user:', !!user, 'token:', !!token);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary">
        <div className="text-center">
          <div className={`animate-spin rounded-full h-32 w-32 border-b-2 border-interactive-primary mx-auto mb-4 ${isPixelTheme ? 'pixel-perfect' : ''}`}></div>
          <p className={`text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background-secondary">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-background-primary shadow-default transition-all duration-300 ease-in-out animate-slide-in-left ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } lg:static lg:inset-0 ${isPixelTheme ? 'pixel-perfect' : ''}`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-border-default">
            {!sidebarCollapsed && (
              <Link href="/dashboard" className={`text-xl font-bold text-interactive-primary ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>
                PromptCraft
              </Link>
            )}
            <div className="flex items-center space-x-2">
              <CompactThemeSelector />
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="rounded-md p-2 text-text-muted hover:bg-background-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-interactive-primary focus:ring-inset transition-colors duration-200"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <svg 
                  className={`h-5 w-5 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {sidebarItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-default px-2 py-2 text-sm font-medium transition-colors duration-200 ${
                  item.active
                    ? 'bg-background-accent text-text-accent border border-border-accent'
                    : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary border border-transparent'
                } ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}
              >
                <span className="mr-3 text-lg" aria-hidden="true">
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            ))}
          </nav>

          {/* User Info */}
          {!sidebarCollapsed && (
            <div className="border-t border-border-default p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {user?.profile_photo_url ? (
                    <img
                      src={user.profile_photo_url}
                      alt="Profile"
                      className={`h-8 w-8 rounded-full border border-border-subtle ${isPixelTheme ? 'pixel-perfect' : ''}`}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-background-accent border border-border-accent flex items-center justify-center">
                      <span className={`text-sm font-medium text-text-accent ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="ml-3">
                    <p className={`text-sm font-medium text-text-primary truncate ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                      {user?.username || 'User'}
                    </p>
                    <p className={`text-xs text-text-success ${isPixelTheme ? 'font-pixel pixel-text' : 'smooth-text'}`}>
                      Online
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-background-secondary focus:outline-none focus:ring-2 focus:ring-interactive-primary transition-colors duration-200"
                  aria-label="Logout"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-auto transition-all duration-300 bg-background-primary ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Mobile sidebar overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}