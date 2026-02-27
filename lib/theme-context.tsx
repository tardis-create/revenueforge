'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  ThemeConfig,
  themePresets,
  getThemeById,
  THEME_STORAGE_KEY,
  DEFAULT_THEME_ID,
  themeToCssVars,
} from './theme-config';

interface ThemeContextValue {
  // Current active theme
  theme: ThemeConfig;
  // All available theme presets
  themes: ThemeConfig[];
  // Set theme by ID
  setTheme: (themeId: string) => void;
  // Set custom theme (for white-labeling)
  setCustomTheme: (theme: Partial<ThemeConfig>) => void;
  // Check if current theme is dark
  isDark: boolean;
  // Branding options
  branding: BrandingOptions;
  // Update branding
  setBranding: (branding: Partial<BrandingOptions>) => void;
}

interface BrandingOptions {
  companyName: string;
  logo?: string;
  logoDark?: string;
  tagline?: string;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  // Initial theme ID (overrides stored preference)
  initialTheme?: string;
  // Custom branding (for white-label instances)
  initialBranding?: Partial<BrandingOptions>;
}

export function ThemeProvider({
  children,
  initialTheme,
  initialBranding,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeConfig>(() => {
    // Use initial theme if provided
    if (initialTheme) {
      return getThemeById(initialTheme);
    }
    // Default to dark theme during SSR
    return getThemeById(DEFAULT_THEME_ID);
  });

  const [branding, setBrandingState] = useState<BrandingOptions>(() => ({
    companyName: theme.companyName || 'RevenueForge',
    tagline: 'B2B Industrial Marketplace',
    ...initialBranding,
  }));

  // Load saved theme on mount (client-side only)
  useEffect(() => {
    if (initialTheme) return; // Skip if initial theme was provided
    
    try {
      const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedThemeId) {
        const savedTheme = getThemeById(savedThemeId);
        setThemeState(savedTheme);
        setBrandingState(prev => ({
          ...prev,
          companyName: savedTheme.companyName || prev.companyName,
        }));
      }
    } catch (e) {
      // localStorage not available (SSR or private mode)
      console.warn('Could not load saved theme:', e);
    }
  }, [initialTheme]);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    const cssVars = themeToCssVars(theme);
    
    // Apply CSS custom properties
    root.setAttribute('style', cssVars);
    
    // Set data attribute for theme ID (useful for CSS selectors)
    root.setAttribute('data-theme', theme.id);
    
    // Set dark/light class for Tailwind dark mode
    const isDark = isThemeDark(theme);
    root.classList.toggle('dark', isDark);
    root.classList.toggle('light', !isDark);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.colors.background);
    }
  }, [theme]);

  // Set theme by ID
  const setTheme = useCallback((themeId: string) => {
    const newTheme = getThemeById(themeId);
    setThemeState(newTheme);
    
    // Save to localStorage
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch (e) {
      console.warn('Could not save theme preference:', e);
    }
  }, []);

  // Set custom theme (for white-labeling)
  const setCustomTheme = useCallback((customTheme: Partial<ThemeConfig>) => {
    setThemeState(prev => ({
      ...prev,
      ...customTheme,
      id: customTheme.id || 'custom',
      name: customTheme.name || 'Custom Theme',
      colors: {
        ...prev.colors,
        ...customTheme.colors,
      },
    }));
  }, []);

  // Update branding
  const setBranding = useCallback((newBranding: Partial<BrandingOptions>) => {
    setBrandingState(prev => ({
      ...prev,
      ...newBranding,
    }));
  }, []);

  // Check if current theme is dark
  const isDark = isThemeDark(theme);

  const value: ThemeContextValue = {
    theme,
    themes: themePresets,
    setTheme,
    setCustomTheme,
    isDark,
    branding,
    setBranding,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Helper to determine if a theme is dark
function isThemeDark(theme: ThemeConfig): boolean {
  const bg = theme.colors.background;
  // Parse hex color and check luminance
  const hex = bg.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  // Relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}
