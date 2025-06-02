/**
 * Design Tokens for PromptCraft
 * 
 * This file contains the core design tokens that define the visual language
 * of the application across all themes.
 */

// Core primitive tokens
export const coreTokens = {
  // Color primitives
  colors: {
    // Grayscale
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
    
    // Brand colors
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    
    // Status colors
    green: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    
    red: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
    
    yellow: {
      50: '#fefce8',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    
    // Pixel theme colors
    pixel: {
      black: '#000000',
      white: '#ffffff',
      silver: '#c0c0c0',
      darkGray: '#808080',
      lightGray: '#e0e0e0',
      blue: '#0000ff',
      red: '#ff0000',
      green: '#00ff00',
      yellow: '#ffff00',
      magenta: '#ff00ff',
      cyan: '#00ffff',
    },
    
    // Pure colors
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
      pixel: ['"Press Start 2P"', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  // Spacing scale
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
  },
  
  // Border radius
  radii: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
    pixel: '0', // Sharp edges for pixel theme
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000',
    pixel: '2px 2px 0px #000000', // Retro pixel shadow
  },
  
  // Motion
  motion: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
      slower: '500ms',
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      pixel: 'steps(4, end)', // Stepped animation for pixel theme
    },
  },
} as const;

// Semantic token definitions for each theme
export const themeTokens = {
  light: {
    colors: {
      // Text colors
      text: {
        primary: coreTokens.colors.gray[900],
        secondary: coreTokens.colors.gray[600],
        muted: coreTokens.colors.gray[500],
        inverse: coreTokens.colors.white,
        accent: coreTokens.colors.blue[600],
        success: coreTokens.colors.green[600],
        warning: coreTokens.colors.yellow[600],
        error: coreTokens.colors.red[600],
      },
      
      // Background colors
      background: {
        primary: coreTokens.colors.white,
        secondary: coreTokens.colors.gray[50],
        tertiary: coreTokens.colors.gray[100],
        inverse: coreTokens.colors.gray[900],
        accent: coreTokens.colors.blue[50],
        success: coreTokens.colors.green[50],
        warning: coreTokens.colors.yellow[50],
        error: coreTokens.colors.red[50],
      },
      
      // Border colors
      border: {
        subtle: coreTokens.colors.gray[200],
        default: coreTokens.colors.gray[300],
        strong: coreTokens.colors.gray[400],
        accent: coreTokens.colors.blue[300],
        success: coreTokens.colors.green[300],
        warning: coreTokens.colors.yellow[300],
        error: coreTokens.colors.red[300],
      },
      
      // Interactive colors
      interactive: {
        primary: coreTokens.colors.blue[600],
        primaryHover: coreTokens.colors.blue[700],
        primaryActive: coreTokens.colors.blue[800],
        secondary: coreTokens.colors.gray[100],
        secondaryHover: coreTokens.colors.gray[200],
        secondaryActive: coreTokens.colors.gray[300],
      },
    },
  },
  
  dark: {
    colors: {
      // Text colors
      text: {
        primary: coreTokens.colors.gray[100],
        secondary: coreTokens.colors.gray[300],
        muted: coreTokens.colors.gray[400],
        inverse: coreTokens.colors.gray[900],
        accent: coreTokens.colors.blue[400],
        success: coreTokens.colors.green[400],
        warning: coreTokens.colors.yellow[400],
        error: coreTokens.colors.red[400],
      },
      
      // Background colors
      background: {
        primary: coreTokens.colors.gray[900],
        secondary: coreTokens.colors.gray[800],
        tertiary: coreTokens.colors.gray[700],
        inverse: coreTokens.colors.white,
        accent: coreTokens.colors.blue[950],
        success: coreTokens.colors.green[950],
        warning: coreTokens.colors.yellow[950],
        error: coreTokens.colors.red[950],
      },
      
      // Border colors
      border: {
        subtle: coreTokens.colors.gray[700],
        default: coreTokens.colors.gray[600],
        strong: coreTokens.colors.gray[500],
        accent: coreTokens.colors.blue[600],
        success: coreTokens.colors.green[600],
        warning: coreTokens.colors.yellow[600],
        error: coreTokens.colors.red[600],
      },
      
      // Interactive colors
      interactive: {
        primary: coreTokens.colors.blue[500],
        primaryHover: coreTokens.colors.blue[400],
        primaryActive: coreTokens.colors.blue[300],
        secondary: coreTokens.colors.gray[700],
        secondaryHover: coreTokens.colors.gray[600],
        secondaryActive: coreTokens.colors.gray[500],
      },
    },
  },
  
  pixel: {
    colors: {
      // Text colors
      text: {
        primary: coreTokens.colors.pixel.black,
        secondary: coreTokens.colors.pixel.darkGray,
        muted: coreTokens.colors.pixel.darkGray,
        inverse: coreTokens.colors.pixel.white,
        accent: coreTokens.colors.pixel.blue,
        success: coreTokens.colors.pixel.green,
        warning: coreTokens.colors.pixel.yellow,
        error: coreTokens.colors.pixel.red,
      },
      
      // Background colors
      background: {
        primary: coreTokens.colors.pixel.silver,
        secondary: coreTokens.colors.pixel.lightGray,
        tertiary: coreTokens.colors.pixel.white,
        inverse: coreTokens.colors.pixel.black,
        accent: coreTokens.colors.pixel.blue,
        success: coreTokens.colors.pixel.green,
        warning: coreTokens.colors.pixel.yellow,
        error: coreTokens.colors.pixel.red,
      },
      
      // Border colors
      border: {
        subtle: coreTokens.colors.pixel.darkGray,
        default: coreTokens.colors.pixel.black,
        strong: coreTokens.colors.pixel.black,
        accent: coreTokens.colors.pixel.blue,
        success: coreTokens.colors.pixel.green,
        warning: coreTokens.colors.pixel.yellow,
        error: coreTokens.colors.pixel.red,
      },
      
      // Interactive colors
      interactive: {
        primary: coreTokens.colors.pixel.blue,
        primaryHover: coreTokens.colors.pixel.cyan,
        primaryActive: coreTokens.colors.pixel.magenta,
        secondary: coreTokens.colors.pixel.silver,
        secondaryHover: coreTokens.colors.pixel.lightGray,
        secondaryActive: coreTokens.colors.pixel.white,
      },
    },
  },
} as const;

// Theme-specific configurations
export const themeConfigs = {
  light: {
    fontFamily: coreTokens.typography.fontFamily.sans,
    borderRadius: coreTokens.radii.base,
    shadows: coreTokens.shadows.base,
    motion: {
      duration: coreTokens.motion.duration.normal,
      easing: coreTokens.motion.easing.easeOut,
    },
  },
  dark: {
    fontFamily: coreTokens.typography.fontFamily.sans,
    borderRadius: coreTokens.radii.base,
    shadows: coreTokens.shadows.lg,
    motion: {
      duration: coreTokens.motion.duration.normal,
      easing: coreTokens.motion.easing.easeOut,
    },
  },
  pixel: {
    fontFamily: coreTokens.typography.fontFamily.pixel,
    borderRadius: coreTokens.radii.pixel,
    shadows: coreTokens.shadows.pixel,
    motion: {
      duration: coreTokens.motion.duration.fast,
      easing: coreTokens.motion.easing.pixel,
    },
  },
} as const;

// Type definitions
export type Theme = keyof typeof themeTokens;
export type ThemeTokens = typeof themeTokens;
export type CoreTokens = typeof coreTokens;