'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ThemeSelector } from '@/components/theme/ThemeSelector';

export default function ThemeDemoPage() {
  const { theme, isPixelTheme, tokens } = useTheme();

  return (
    <div className="min-h-screen bg-background-primary p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold text-text-primary mb-4 ${isPixelTheme ? 'font-pixel text-2xl pixel-text' : 'smooth-text'}`}>
            PromptCraft Theme System
          </h1>
          <p className={`text-lg text-text-secondary max-w-2xl mx-auto ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>
            Experience the power of our comprehensive design token system with three distinct themes: 
            Light, Dark, and our unique Pixel theme (default).
          </p>
          <div className={`mt-6 inline-flex items-center px-4 py-2 bg-background-accent text-text-accent rounded-default border border-border-accent ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
            Currently using: <strong className="ml-2 capitalize">{theme}</strong> theme
          </div>
        </div>

        {/* Theme Selector */}
        <div className="mb-12">
          <ThemeSelector />
        </div>

        {/* Color Palette Showcase */}
        <Card>
          <CardHeader>
            <h2 className={`text-2xl font-semibold text-text-primary ${isPixelTheme ? 'font-pixel text-lg pixel-text' : 'smooth-text'}`}>
              Color Palette
            </h2>
            <p className={`text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
              Current theme color tokens in action
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Text Colors */}
              <div className="space-y-3">
                <h3 className={`font-semibold text-text-primary ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>Text</h3>
                <div className="space-y-2">
                  <div className={`p-3 bg-background-secondary rounded-default border border-border-subtle ${isPixelTheme ? 'pixel-perfect' : ''}`}>
                    <span className={`text-text-primary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>Primary Text</span>
                  </div>
                  <div className={`p-3 bg-background-secondary rounded-default border border-border-subtle ${isPixelTheme ? 'pixel-perfect' : ''}`}>
                    <span className={`text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>Secondary Text</span>
                  </div>
                  <div className={`p-3 bg-background-secondary rounded-default border border-border-subtle ${isPixelTheme ? 'pixel-perfect' : ''}`}>
                    <span className={`text-text-accent ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>Accent Text</span>
                  </div>
                </div>
              </div>

              {/* Background Colors */}
              <div className="space-y-3">
                <h3 className={`font-semibold text-text-primary ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>Background</h3>
                <div className="space-y-2">
                  <div className={`p-3 bg-background-primary border border-border-default rounded-default ${isPixelTheme ? 'pixel-perfect' : ''}`}>
                    <span className={`text-text-primary text-xs ${isPixelTheme ? 'font-pixel pixel-text' : 'smooth-text'}`}>Primary</span>
                  </div>
                  <div className={`p-3 bg-background-secondary border border-border-default rounded-default ${isPixelTheme ? 'pixel-perfect' : ''}`}>
                    <span className={`text-text-primary text-xs ${isPixelTheme ? 'font-pixel pixel-text' : 'smooth-text'}`}>Secondary</span>
                  </div>
                  <div className={`p-3 bg-background-accent border border-border-accent rounded-default ${isPixelTheme ? 'pixel-perfect' : ''}`}>
                    <span className={`text-text-accent text-xs ${isPixelTheme ? 'font-pixel pixel-text' : 'smooth-text'}`}>Accent</span>
                  </div>
                </div>
              </div>

              {/* Status Colors */}
              <div className="space-y-3">
                <h3 className={`font-semibold text-text-primary ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>Status</h3>
                <div className="space-y-2">
                  <div className={`p-3 bg-background-success border border-border-success rounded-default ${isPixelTheme ? 'pixel-perfect' : ''}`}>
                    <span className={`text-text-success text-xs ${isPixelTheme ? 'font-pixel pixel-text' : 'smooth-text'}`}>Success</span>
                  </div>
                  <div className={`p-3 bg-background-warning border border-border-warning rounded-default ${isPixelTheme ? 'pixel-perfect' : ''}`}>
                    <span className={`text-text-warning text-xs ${isPixelTheme ? 'font-pixel pixel-text' : 'smooth-text'}`}>Warning</span>
                  </div>
                  <div className={`p-3 bg-background-error border border-border-error rounded-default ${isPixelTheme ? 'pixel-perfect' : ''}`}>
                    <span className={`text-text-error text-xs ${isPixelTheme ? 'font-pixel pixel-text' : 'smooth-text'}`}>Error</span>
                  </div>
                </div>
              </div>

              {/* Interactive Colors */}
              <div className="space-y-3">
                <h3 className={`font-semibold text-text-primary ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>Interactive</h3>
                <div className="space-y-2">
                  <Button className="w-full text-xs">
                    Primary Button
                  </Button>
                  <button className={`w-full p-2 bg-interactive-secondary hover:bg-interactive-secondary-hover text-text-primary rounded-default border border-border-default transition-colors duration-200 ${isPixelTheme ? 'font-pixel text-xs pixel-text pixel-perfect' : 'smooth-text'}`}>
                    Secondary
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography Showcase */}
        <Card>
          <CardHeader>
            <h2 className={`text-2xl font-semibold text-text-primary ${isPixelTheme ? 'font-pixel text-lg pixel-text' : 'smooth-text'}`}>
              Typography
            </h2>
            <p className={`text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
              Font family and rendering for current theme
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h1 className={`text-4xl font-bold text-text-primary mb-2 ${isPixelTheme ? 'font-pixel text-2xl pixel-text' : 'smooth-text'}`}>
                  Heading 1
                </h1>
                <h2 className={`text-3xl font-semibold text-text-primary mb-2 ${isPixelTheme ? 'font-pixel text-xl pixel-text' : 'smooth-text'}`}>
                  Heading 2
                </h2>
                <h3 className={`text-2xl font-medium text-text-primary mb-2 ${isPixelTheme ? 'font-pixel text-lg pixel-text' : 'smooth-text'}`}>
                  Heading 3
                </h3>
              </div>
              
              <div>
                <p className={`text-base text-text-primary mb-2 ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>
                  Regular paragraph text with primary color. This demonstrates how text renders in the current theme.
                </p>
                <p className={`text-sm text-text-secondary mb-2 ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                  Secondary text is slightly muted and used for less important information.
                </p>
                <p className={`text-xs text-text-muted ${isPixelTheme ? 'font-pixel pixel-text' : 'smooth-text'}`}>
                  Muted text is the most subtle and used for metadata and less critical details.
                </p>
              </div>

              {isPixelTheme && (
                <div className="p-4 bg-background-accent border border-border-accent rounded-default">
                  <h4 className="font-pixel text-sm text-text-accent pixel-text mb-2">PIXEL THEME ACTIVE</h4>
                  <p className="font-pixel text-xs text-text-secondary pixel-text">
                    You&apos;re currently experiencing the pixel theme with retro gaming aesthetics, 
                    pixelated fonts, and sharp edges for a nostalgic computing experience.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Component Showcase */}
        <Card>
          <CardHeader>
            <h2 className={`text-2xl font-semibold text-text-primary ${isPixelTheme ? 'font-pixel text-lg pixel-text' : 'smooth-text'}`}>
              Components
            </h2>
            <p className={`text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
              UI components adapting to the current theme
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className={`font-semibold text-text-primary ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>Buttons</h3>
                <div className="space-y-3">
                  <Button className="w-full">Primary Button</Button>
                  <button className={`w-full py-2 px-4 border border-border-default text-text-primary bg-background-secondary hover:bg-background-tertiary rounded-default transition-colors duration-200 ${isPixelTheme ? 'font-pixel text-xs pixel-text pixel-perfect' : 'smooth-text'}`}>
                    Secondary Button
                  </button>
                  <button className={`w-full py-2 px-4 text-text-accent hover:text-text-primary transition-colors duration-200 ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                    Text Button
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className={`font-semibold text-text-primary ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>Cards & Borders</h3>
                <div className="space-y-3">
                  <div className={`p-4 bg-background-secondary border border-border-subtle rounded-default ${isPixelTheme ? 'pixel-perfect' : ''}`}>
                    <p className={`text-text-primary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>Subtle border card</p>
                  </div>
                  <div className={`p-4 bg-background-primary border border-border-default rounded-default shadow-default ${isPixelTheme ? 'pixel-perfect' : ''}`}>
                    <p className={`text-text-primary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>Default border with shadow</p>
                  </div>
                  <div className={`p-4 bg-background-accent border border-border-accent rounded-default ${isPixelTheme ? 'pixel-perfect' : ''}`}>
                    <p className={`text-text-accent ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>Accent border card</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Features */}
        <Card>
          <CardHeader>
            <h2 className={`text-2xl font-semibold text-text-primary ${isPixelTheme ? 'font-pixel text-lg pixel-text' : 'smooth-text'}`}>
              Theme System Features
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 bg-background-secondary border border-border-subtle rounded-default ${isPixelTheme ? 'pixel-perfect' : ''}`}>
                <h3 className={`text-lg font-semibold text-text-primary mb-3 ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>
                  🎨 Design Tokens
                </h3>
                <p className={`text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                  Semantic color system with consistent naming across all themes
                </p>
              </div>

              <div className={`p-6 bg-background-secondary border border-border-subtle rounded-default ${isPixelTheme ? 'pixel-perfect' : ''}`}>
                <h3 className={`text-lg font-semibold text-text-primary mb-3 ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>
                  💾 Persistence
                </h3>
                <p className={`text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                  Theme preferences are automatically saved to localStorage
                </p>
              </div>

              <div className={`p-6 bg-background-secondary border border-border-subtle rounded-default ${isPixelTheme ? 'pixel-perfect' : ''}`}>
                <h3 className={`text-lg font-semibold text-text-primary mb-3 ${isPixelTheme ? 'font-pixel text-sm pixel-text' : 'smooth-text'}`}>
                  ⚡ Live Updates
                </h3>
                <p className={`text-text-secondary ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
                  Instant theme switching with smooth transitions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8">
          <p className={`text-text-muted ${isPixelTheme ? 'font-pixel text-xs pixel-text' : 'smooth-text'}`}>
            PromptCraft Theme System - Built with design tokens, Tailwind CSS, and React Context
          </p>
        </div>
      </div>
    </div>
  );
}