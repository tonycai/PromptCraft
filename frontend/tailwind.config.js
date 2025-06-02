/** @type {import('tailwindcss').Config} */
const { coreTokens } = require('./src/lib/tokens');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Core design tokens
      colors: {
        ...coreTokens.colors,
        // CSS custom property-based theme colors
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
          accent: 'var(--color-text-accent)',
          success: 'var(--color-text-success)',
          warning: 'var(--color-text-warning)',
          error: 'var(--color-text-error)',
        },
        background: {
          primary: 'var(--color-background-primary)',
          secondary: 'var(--color-background-secondary)',
          tertiary: 'var(--color-background-tertiary)',
          inverse: 'var(--color-background-inverse)',
          accent: 'var(--color-background-accent)',
          success: 'var(--color-background-success)',
          warning: 'var(--color-background-warning)',
          error: 'var(--color-background-error)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          default: 'var(--color-border-default)',
          strong: 'var(--color-border-strong)',
          accent: 'var(--color-border-accent)',
          success: 'var(--color-border-success)',
          warning: 'var(--color-border-warning)',
          error: 'var(--color-border-error)',
        },
        interactive: {
          primary: 'var(--color-interactive-primary)',
          'primary-hover': 'var(--color-interactive-primaryHover)',
          'primary-active': 'var(--color-interactive-primaryActive)',
          secondary: 'var(--color-interactive-secondary)',
          'secondary-hover': 'var(--color-interactive-secondaryHover)',
          'secondary-active': 'var(--color-interactive-secondaryActive)',
        },
      },
      
      fontFamily: {
        ...coreTokens.typography.fontFamily,
        primary: 'var(--font-family-primary)',
      },
      
      fontSize: coreTokens.typography.fontSize,
      fontWeight: coreTokens.typography.fontWeight,
      
      spacing: coreTokens.spacing,
      
      borderRadius: {
        ...coreTokens.radii,
        default: 'var(--border-radius-default)',
      },
      
      boxShadow: {
        ...coreTokens.shadows,
        default: 'var(--shadow-default)',
      },
      
      transitionDuration: coreTokens.motion.duration,
      transitionTimingFunction: {
        ...coreTokens.motion.easing,
        default: 'var(--motion-easing-default)',
      },
      
      // Animation utilities
      animation: {
        'fade-in': 'fadeIn var(--motion-duration-default) var(--motion-easing-default)',
        'slide-up': 'slideUp var(--motion-duration-default) var(--motion-easing-default)',
        'scale-in': 'scaleIn var(--motion-duration-default) var(--motion-easing-default)',
        'pixel-bounce': 'pixelBounce 0.5s steps(4, end) infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pixelBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [
    // Custom plugin for theme-specific utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.pixel-perfect': {
          'image-rendering': 'pixelated',
          'image-rendering': '-moz-crisp-edges',
          'image-rendering': 'crisp-edges',
        },
        '.smooth-rendering': {
          'image-rendering': 'auto',
        },
        '.pixel-text': {
          'font-smooth': 'never',
          '-webkit-font-smoothing': 'none',
          '-moz-osx-font-smoothing': 'unset',
        },
        '.smooth-text': {
          'font-smooth': 'auto',
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
        },
      };
      
      addUtilities(newUtilities);
    },
  ],
};