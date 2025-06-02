'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/lib/tokens';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface ThemeOption {
  id: Theme;
  name: string;
  description: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
  };
  icon: React.ReactNode;
}

const themeOptions: ThemeOption[] = [
  {
    id: 'pixel',
    name: 'Pixel',
    description: 'Retro gaming aesthetic with pixelated elements',
    preview: {
      primary: '#c0c0c0',
      secondary: '#000000',
      accent: '#0000ff',
    },
    icon: (
      <div className="w-6 h-6 grid grid-cols-2 gap-0.5">
        <div className="bg-gray-800 w-2 h-2"></div>
        <div className="bg-blue-500 w-2 h-2"></div>
        <div className="bg-blue-500 w-2 h-2"></div>
        <div className="bg-gray-800 w-2 h-2"></div>
      </div>
    ),
  },
  {
    id: 'light',
    name: 'Light',
    description: 'Clean and modern light interface',
    preview: {
      primary: '#ffffff',
      secondary: '#f3f4f6',
      accent: '#3b82f6',
    },
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Easy on the eyes dark interface',
    preview: {
      primary: '#111827',
      secondary: '#1f2937',
      accent: '#60a5fa',
    },
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
  },
];

export function ThemeSelector() {
  const { theme, setTheme, isPixelTheme } = useTheme();

  return (
    <Card className="bg-background-primary border-border-default">
      <CardHeader>
        <h3 className={`text-lg font-semibold text-text-primary ${isPixelTheme ? 'pixel-text font-pixel' : 'smooth-text'}`}>
          Theme Settings
        </h3>
        <p className={`text-sm text-text-secondary ${isPixelTheme ? 'pixel-text font-pixel' : 'smooth-text'}`}>
          Choose your preferred visual theme. Pixel theme is set as default for a retro experience.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setTheme(option.id)}
              className={`
                group relative p-4 rounded-lg border-2 text-left transition-all duration-200
                ${theme === option.id
                  ? 'border-border-accent bg-background-accent'
                  : 'border-border-subtle hover:border-border-default bg-background-secondary hover:bg-background-tertiary'
                }
                ${isPixelTheme ? 'pixel-text' : 'smooth-text'}
              `}
            >
              <div className="flex items-start space-x-4">
                {/* Theme Icon */}
                <div className={`
                  flex-shrink-0 p-2 rounded-md text-text-secondary group-hover:text-text-primary transition-colors
                  ${theme === option.id ? 'text-text-accent' : ''}
                `}>
                  {option.icon}
                </div>
                
                {/* Theme Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`
                      font-medium text-text-primary
                      ${isPixelTheme && option.id === 'pixel' ? 'font-pixel text-xs' : ''}
                      ${isPixelTheme && option.id !== 'pixel' ? 'font-pixel text-xs' : ''}
                    `}>
                      {option.name}
                    </span>
                    
                    {option.id === 'pixel' && (
                      <span className={`
                        px-2 py-1 text-xs rounded font-medium
                        ${isPixelTheme ? 'font-pixel' : ''}
                        ${theme === option.id 
                          ? 'bg-background-accent text-text-accent border border-border-accent' 
                          : 'bg-background-primary text-text-muted border border-border-subtle'
                        }
                      `}>
                        DEFAULT
                      </span>
                    )}
                    
                    {theme === option.id && (
                      <span className="flex items-center text-text-accent">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                  
                  <p className={`
                    text-sm text-text-secondary
                    ${isPixelTheme && option.id === 'pixel' ? 'font-pixel text-xs' : ''}
                    ${isPixelTheme && option.id !== 'pixel' ? 'font-pixel text-xs' : ''}
                  `}>
                    {option.description}
                  </p>
                </div>
                
                {/* Color Preview */}
                <div className="flex-shrink-0 flex space-x-1">
                  <div 
                    className="w-4 h-4 rounded-sm border border-border-subtle"
                    style={{ backgroundColor: option.preview.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-sm border border-border-subtle"
                    style={{ backgroundColor: option.preview.secondary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-sm border border-border-subtle"
                    style={{ backgroundColor: option.preview.accent }}
                  />
                </div>
              </div>
              
              {/* Active Indicator */}
              {theme === option.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-interactive-primary rounded-full animate-pulse" />
                </div>
              )}
            </button>
          ))}
        </div>
        
        {/* Theme Information */}
        <div className="mt-6 p-4 bg-background-accent border border-border-accent rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className={`text-sm font-medium text-text-accent ${isPixelTheme ? 'font-pixel' : ''}`}>
                Theme Preferences
              </h4>
              <p className={`mt-1 text-sm text-text-secondary ${isPixelTheme ? 'font-pixel text-xs' : ''}`}>
                Your theme preference is automatically saved and will be applied across all sessions. 
                The pixel theme provides a nostalgic retro computing experience with crisp, pixelated fonts and sharp edges.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact theme selector for the navbar
export function CompactThemeSelector() {
  const { theme, setTheme, isPixelTheme } = useTheme();

  const getThemeIcon = (themeId: Theme) => {
    switch (themeId) {
      case 'light':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'dark':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        );
      case 'pixel':
        return (
          <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
            <div className="bg-current w-1 h-1"></div>
            <div className="bg-current w-1 h-1 opacity-50"></div>
            <div className="bg-current w-1 h-1 opacity-50"></div>
            <div className="bg-current w-1 h-1"></div>
          </div>
        );
      default:
        return null;
    }
  };

  const nextTheme = (): Theme => {
    const themes: Theme[] = ['pixel', 'light', 'dark'];
    const currentIndex = themes.indexOf(theme);
    return themes[(currentIndex + 1) % themes.length];
  };

  return (
    <button
      onClick={() => setTheme(nextTheme())}
      className={`
        p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-secondary
        transition-colors duration-200 
        ${isPixelTheme ? 'pixel-text' : 'smooth-text'}
      `}
      title={`Current: ${theme} theme. Click to switch.`}
    >
      {getThemeIcon(theme)}
    </button>
  );
}