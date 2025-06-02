'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, themeTokens, themeConfigs } from '@/lib/tokens';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  tokens: typeof themeTokens[Theme];
  config: typeof themeConfigs[Theme];
  isPixelTheme: boolean;
  isDarkTheme: boolean;
  isLightTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'promptcraft-theme';
const DEFAULT_THEME: Theme = 'pixel'; // Default to pixel theme as requested

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
    if (savedTheme && savedTheme in themeTokens) {
      setThemeState(savedTheme);
    }
    setMounted(true);
  }, []);

  // Save theme to localStorage and apply to document
  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem(THEME_STORAGE_KEY, theme);
    
    // Remove all theme classes
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-pixel');
    
    // Add current theme class
    document.documentElement.classList.add(`theme-${theme}`);
    
    // Set CSS custom properties for the current theme
    const root = document.documentElement;
    const currentTokens = themeTokens[theme];
    const currentConfig = themeConfigs[theme];
    
    // Apply color tokens
    Object.entries(currentTokens.colors.text).forEach(([key, value]) => {
      root.style.setProperty(`--color-text-${key}`, value);
    });
    
    Object.entries(currentTokens.colors.background).forEach(([key, value]) => {
      root.style.setProperty(`--color-background-${key}`, value);
    });
    
    Object.entries(currentTokens.colors.border).forEach(([key, value]) => {
      root.style.setProperty(`--color-border-${key}`, value);
    });
    
    Object.entries(currentTokens.colors.interactive).forEach(([key, value]) => {
      root.style.setProperty(`--color-interactive-${key}`, value);
    });
    
    // Apply config tokens
    root.style.setProperty('--font-family-primary', currentConfig.fontFamily.join(', '));
    root.style.setProperty('--border-radius-default', currentConfig.borderRadius);
    root.style.setProperty('--shadow-default', currentConfig.shadows);
    root.style.setProperty('--motion-duration-default', currentConfig.motion.duration);
    root.style.setProperty('--motion-easing-default', currentConfig.motion.easing);
    
    // Special handling for pixel theme
    if (theme === 'pixel') {
      root.style.setProperty('--font-rendering', 'pixelated');
      root.style.setProperty('image-rendering', 'pixelated');
    } else {
      root.style.setProperty('--font-rendering', 'auto');
      root.style.setProperty('image-rendering', 'auto');
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return <div className="animate-pulse bg-gray-100 min-h-screen" />;
  }

  const value: ThemeContextType = {
    theme,
    setTheme,
    tokens: themeTokens[theme],
    config: themeConfigs[theme],
    isPixelTheme: theme === 'pixel',
    isDarkTheme: theme === 'dark',
    isLightTheme: theme === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Custom hook for theme-aware animations
export function useThemeAnimation() {
  const { config, isPixelTheme } = useTheme();
  
  return {
    duration: config.motion.duration,
    easing: config.motion.easing,
    getTransition: (property = 'all') => 
      `${property} ${config.motion.duration} ${config.motion.easing}`,
    getHoverTransform: () => 
      isPixelTheme ? 'translate(1px, 1px)' : 'translateY(-2px)',
  };
}