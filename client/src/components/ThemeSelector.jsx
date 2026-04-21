'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, Sun, Moon, Cloud, Sparkles, Zap, Globe, 
  Mountain, Waves, Flame, Leaf, Snowflake, Crown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

// Simple Clean Themes - Light, Dark, Blue, Pink
const VISION_THEMES = [
  {
    id: 'light-theme',
    name: 'Light',
    icon: Sun,
    description: 'Temiz light tema',
    concept: 'light',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#666666',
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#000000',
      textSecondary: '#666666',
      border: '#e0e0e0',
      shadow: 'rgba(0, 0, 0, 0.1)'
    }
  },
  {
    id: 'dark-theme',
    name: 'Dark',
    icon: Moon,
    description: 'Modern dark tema',
    concept: 'dark',
    colors: {
      primary: '#ffffff',
      secondary: '#cccccc',
      accent: '#999999',
      background: '#1a1a1a',
      surface: '#2d2d2d',
      text: '#ffffff',
      textSecondary: '#cccccc',
      border: '#404040',
      shadow: 'rgba(0, 0, 0, 0.3)'
    }
  },
  {
    id: 'blue-theme',
    name: 'Blue',
    icon: Waves,
    description: 'Modern blue tema',
    concept: 'blue',
    colors: {
      primary: '#2563eb',
      secondary: '#3b82f6',
      accent: '#60a5fa',
      background: '#f0f9ff',
      surface: '#ffffff',
      text: '#1e40af',
      textSecondary: '#3b82f6',
      border: '#bfdbfe',
      shadow: 'rgba(37, 99, 235, 0.1)'
    }
  },
  {
    id: 'pink-theme',
    name: 'Pink',
    icon: Flame,
    description: 'Modern pink tema',
    concept: 'pink',
    colors: {
      primary: '#ec4899',
      secondary: '#f472b6',
      accent: '#f9a8d4',
      background: '#fdf2f8',
      surface: '#ffffff',
      text: '#be185d',
      textSecondary: '#ec4899',
      border: '#fbcfe8',
      shadow: 'rgba(236, 72, 153, 0.1)'
    }
  }
];

export default function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('ocean-breeze');

  useEffect(() => {
    const saved = localStorage.getItem('vision-theme');
    if (saved) {
      setCurrentTheme(saved);
      applyTheme(saved);
    }
  }, []);

  const applyTheme = (themeId) => {
    const theme = VISION_THEMES.find(t => t.id === themeId);
    if (!theme) return;

    // Apply theme to document root
    const root = document.documentElement;
    const body = document.body;
    
    // Remove all theme classes
    VISION_THEMES.forEach(t => {
      root.classList.remove(`theme-${t.id}`);
      body.classList.remove(`theme-${t.id}`);
    });
    
    // Add current theme class
    root.classList.add(`theme-${themeId}`);
    body.classList.add(`theme-${themeId}`);
    
    // Create or update theme style tag with higher specificity
    let themeStyle = document.getElementById('vision-theme-styles');
    if (!themeStyle) {
      themeStyle = document.createElement('style');
      themeStyle.id = 'vision-theme-styles';
      themeStyle.type = 'text/css';
      document.head.appendChild(themeStyle);
    }
    
    // Generate simple theme CSS
    let themeCSS = '';
    
    if (theme.concept === 'light') {
      themeCSS = `
        /* LIGHT THEME */
        html.theme-${themeId} body.theme-${themeId} {
          background: ${theme.colors.background} !important;
          color: ${theme.colors.text} !important;
        }
        
        html.theme-${themeId} body.theme-${themeId} div[class*="bg-white"],
        html.theme-${themeId} body.theme-${themeId} div[class*="bg-slate-50"],
        html.theme-${themeId} body.theme-${themeId} div[class*="bg-gray-50"] {
          background: ${theme.colors.surface} !important;
          border: 1px solid ${theme.colors.border} !important;
          box-shadow: 0 1px 3px ${theme.colors.shadow} !important;
        }
        
        html.theme-${themeId} body.theme-${themeId} button {
          background: ${theme.colors.primary} !important;
          border: 1px solid ${theme.colors.border} !important;
          color: ${theme.colors.background} !important;
        }
        
        html.theme-${themeId} body.theme-${themeId} input,
        html.theme-${themeId} body.theme-${themeId} textarea,
        html.theme-${themeId} body.theme-${themeId} select {
          background: ${theme.colors.surface} !important;
          border: 1px solid ${theme.colors.border} !important;
          color: ${theme.colors.text} !important;
        }
        
        html.theme-${themeId} body.theme-${themeId} [class*="text-slate-900"],
        html.theme-${themeId} body.theme-${themeId} [class*="text-gray-900"] { 
          color: ${theme.colors.text} !important; 
        }
        
        html.theme-${themeId} body.theme-${themeId} [class*="text-slate-600"],
        html.theme-${themeId} body.theme-${themeId} [class*="text-gray-600"] { 
          color: ${theme.colors.textSecondary} !important; 
        }
        
        html.theme-${themeId} body.theme-${themeId} svg { 
          stroke: ${theme.colors.textSecondary} !important; 
          fill: ${theme.colors.textSecondary} !important; 
        }
      `;
    } else if (theme.concept === 'dark') {
      themeCSS = `
        /* DARK THEME */
        html.theme-${themeId} body.theme-${themeId} {
          background: ${theme.colors.background} !important;
          color: ${theme.colors.text} !important;
        }
        
        html.theme-${themeId} body.theme-${themeId} div[class*="bg-white"],
        html.theme-${themeId} body.theme-${themeId} div[class*="bg-slate-50"],
        html.theme-${themeId} body.theme-${themeId} div[class*="bg-gray-50"] {
          background: ${theme.colors.surface} !important;
          border: 1px solid ${theme.colors.border} !important;
          box-shadow: 0 2px 8px ${theme.colors.shadow} !important;
        }
        
        html.theme-${themeId} body.theme-${themeId} button {
          background: ${theme.colors.primary} !important;
          border: 1px solid ${theme.colors.border} !important;
          color: ${theme.colors.background} !important;
        }
        
        html.theme-${themeId} body.theme-${themeId} input,
        html.theme-${themeId} body.theme-${themeId} textarea,
        html.theme-${themeId} body.theme-${themeId} select {
          background: ${theme.colors.surface} !important;
          border: 1px solid ${theme.colors.border} !important;
          color: ${theme.colors.text} !important;
        }
        
        html.theme-${themeId} body.theme-${themeId} [class*="text-slate-900"],
        html.theme-${themeId} body.theme-${themeId} [class*="text-gray-900"] { 
          color: ${theme.colors.text} !important; 
        }
        
        html.theme-${themeId} body.theme-${themeId} [class*="text-slate-600"],
        html.theme-${themeId} body.theme-${themeId} [class*="text-gray-600"] { 
          color: ${theme.colors.textSecondary} !important; 
        }
        
        html.theme-${themeId} body.theme-${themeId} svg { 
          stroke: ${theme.colors.textSecondary} !important; 
          fill: ${theme.colors.textSecondary} !important; 
        }
      `;
    } else if (theme.concept === 'blue') {
      themeCSS = `
        /* BLUE THEME */
        html.theme-${themeId} body.theme-${themeId} {
          background: ${theme.colors.background} !important;
          color: ${theme.colors.text} !important;
        }
        
        html.theme-${themeId} body.theme-${themeId} div[class*="bg-white"],
        html.theme-${themeId} body.theme-${themeId} div[class*="bg-slate-50"],
        html.theme-${themeId} body.theme-${themeId} div[class*="bg-gray-50"] {
          background: ${theme.colors.surface} !important;
          border: 1px solid ${theme.colors.border} !important;
          box-shadow: 0 1px 3px ${theme.colors.shadow} !important;
        }
        
        html.theme-${themeId} body.theme-${themeId} button {
          background: ${theme.colors.primary} !important;
          border: 1px solid ${theme.colors.border} !important;
          color: #ffffff !important;
        }
        
        html.theme-${themeId} body.theme-${themeId} input,
        html.theme-${themeId} body.theme-${themeId} textarea,
        html.theme-${themeId} body.theme-${themeId} select {
          background: ${theme.colors.surface} !important;
          border: 1px solid ${theme.colors.border} !important;
          color: ${theme.colors.text} !important;
        }
        
        html.theme-${themeId} body.theme-${themeId} [class*="text-slate-900"],
        html.theme-${themeId} body.theme-${themeId} [class*="text-gray-900"] { 
          color: ${theme.colors.text} !important; 
        }
        
        html.theme-${themeId} body.theme-${themeId} [class*="text-slate-600"],
        html.theme-${themeId} body.theme-${themeId} [class*="text-gray-600"] { 
          color: ${theme.colors.textSecondary} !important; 
        }
        
        html.theme-${themeId} body.theme-${themeId} svg { 
          stroke: ${theme.colors.textSecondary} !important; 
          fill: ${theme.colors.textSecondary} !important; 
        }
      `;
    } else if (theme.concept === 'pink') {
      themeCSS = `
        /* PINK THEME */
        html.theme-${themeId} body.theme-${themeId} {
          background: ${theme.colors.background} !important;
          color: ${theme.colors.text} !important;
        }
        
        html.theme-${themeId} body.theme-${themeId} div[class*="bg-white"],
        html.theme-${themeId} body.theme-${themeId} div[class*="bg-slate-50"],
        html.theme-${themeId} body.theme-${themeId} div[class*="bg-gray-50"] {
          background: ${theme.colors.surface} !important;
          border: 1px solid ${theme.colors.border} !important;
          box-shadow: 0 1px 3px ${theme.colors.shadow} !important;
        }
        
        html.theme-${themeId} body.theme-${themeId} button {
          background: ${theme.colors.primary} !important;
          border: 1px solid ${theme.colors.border} !important;
          color: #ffffff !important;
        }
        
        html.theme-${themeId} body.theme-${themeId} input,
        html.theme-${themeId} body.theme-${themeId} textarea,
        html.theme-${themeId} body.theme-${themeId} select {
          background: ${theme.colors.surface} !important;
          border: 1px solid ${theme.colors.border} !important;
          color: ${theme.colors.text} !important;
        }
        
        html.theme-${themeId} body.theme-${themeId} [class*="text-slate-900"],
        html.theme-${themeId} body.theme-${themeId} [class*="text-gray-900"] { 
          color: ${theme.colors.text} !important; 
        }
        
        html.theme-${themeId} body.theme-${themeId} [class*="text-slate-600"],
        html.theme-${themeId} body.theme-${themeId} [class*="text-gray-600"] { 
          color: ${theme.colors.textSecondary} !important; 
        }
        
        html.theme-${themeId} body.theme-${themeId} svg { 
          stroke: ${theme.colors.textSecondary} !important; 
          fill: ${theme.colors.textSecondary} !important; 
        }
      `;
    }
    
    // Set CSS with maximum priority
    themeStyle.textContent = themeCSS;
    themeStyle.setAttribute('data-theme', themeId);
    
    // Force style to have highest priority
    themeStyle.style.cssText += 'display: block !important;';
    
    // Remove any existing theme styles and add this one at the end
    const existingStyles = document.querySelectorAll('style[id^="vision-theme-"]');
    existingStyles.forEach(style => {
      if (style.id !== 'vision-theme-styles') {
        style.remove();
      }
    });
    
    // Save to localStorage
    localStorage.setItem('vision-theme', themeId);
    setCurrentTheme(themeId);
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('vision-theme-change', { detail: themeId }));
    
    // Force immediate reflow and clear cache
    void body.offsetWidth;
    
    // Direct DOM manipulation for critical elements
    setTimeout(() => {
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        if (el.style) {
          el.style.setProperty('transition', 'all 0.3s ease', 'important');
        }
      });
    }, 100);
    
    console.log(`Applied revolutionary theme: ${themeId} (${theme.concept}) - MAXIMUM POWER!`);
  };

  const currentThemeData = VISION_THEMES.find(t => t.id === currentTheme);

  return (
    <TooltipProvider>
      <div className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="relative h-10 w-10 p-0 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${currentThemeData?.colors.primary} rounded-md opacity-20`} />
              <Palette className="w-4 h-4 relative z-10" />
              {isOpen && (
                <motion.div
                  layoutId="theme-selector"
                  className="absolute inset-0 bg-slate-100 dark:bg-slate-700 rounded-md"
                />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Vizyon Teması: {currentThemeData?.name}</p>
          </TooltipContent>
        </Tooltip>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />

              {/* Theme Selector Panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-12 z-50 w-80"
              >
                <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Palette className="w-5 h-5 text-violet-500" />
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Vizyon Temaları
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {VISION_THEMES.map((theme) => {
                        const Icon = theme.icon;
                        const isActive = currentTheme === theme.id;
                        
                        return (
                          <motion.button
                            key={theme.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              applyTheme(theme.id);
                              toast.success(`${theme.name} teması uygulandı!`);
                              setIsOpen(false);
                            }}
                            className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                              isActive
                                ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="active-theme"
                                className="absolute inset-0 bg-violet-100 dark:bg-violet-900/30 rounded-xl -z-10"
                              />
                            )}
                            
                            <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${theme.colors.primary} mb-2 flex items-center justify-center text-white shadow-lg`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            
                            <div className="text-center">
                              <h4 className="font-medium text-sm text-slate-900 dark:text-white mb-1">
                                {theme.name}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {theme.description}
                              </p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                    
                                      </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
