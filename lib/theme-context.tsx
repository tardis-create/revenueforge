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
  ThemeColors,
  ThemeFonts,
  themePresets,
  getThemeById,
  themeFromSettings,
  themeToCssVars,
  THEME_STORAGE_KEY,
  DEFAULT_THEME_ID,
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
  // Refresh theme from API settings
  refreshFromSettings: () => Promise<void>;
  // Loading state
  isLoading: boolean;
}

interface BrandingOptions {
  companyName: string;
  logo?: string;
  logoDark?: string;
  tagline?: string;
}

interface SettingsResponse {
  settings: Record<string, unknown>;
  cached?: boolean;
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

  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch theme settings from /api/settings
   * This is called on initial mount to load theme from server
   */
  const fetchSettings = useCallback(async (): Promise<Record<string, unknown> | null> => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        console.warn('Failed to fetch settings:', response.status);
        return null;
      }
      
      const data: SettingsResponse = await response.json();
      return data.settings;
    } catch (error) {
      console.warn('Error fetching settings:', error);
      return null;
    }
  }, []);

  /**
   * Refresh theme from API settings
   * Called on init and can be called manually when settings change
   */
  const refreshFromSettings = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const settings = await fetchSettings();
      
      if (settings) {
        // Convert API settings to theme overrides
        const themeOverrides = themeFromSettings(settings);
        
        // Merge with current theme
        if (Object.keys(themeOverrides).length > 0) {
          setThemeState(prev => ({
            ...prev,
            ...themeOverrides,
            colors: {
              ...prev.colors,
              ...(themeOverrides.colors || {}),
            } as ThemeColors,
            fonts: {
              ...prev.fonts,
              ...(themeOverrides.fonts || {}),
            } as ThemeFonts,
          }));
          
          // Update branding from settings
          if (themeOverrides.companyName) {
            setBrandingState(prev => ({
              ...prev,
              companyName: themeOverrides.companyName!,
            }));
          }
          if (themeOverrides.logo) {
            setBrandingState(prev => ({
              ...prev,
              logo: themeOverrides.logo,
            }));
          }
        }
      }
      
      // After loading from API, check localStorage for user preference
      try {
        const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedThemeId && savedThemeId !== theme.id) {
          const savedTheme = getThemeById(savedThemeId);
          setThemeState(prev => ({
            ...savedTheme,
            // Preserve any API-loaded customizations
            colors: {
              ...savedTheme.colors,
              // Keep primary/accent colors from API if they were set
              ...(prev.colors.primary !== getThemeById(DEFAULT_THEME_ID).colors.primary 
                ? { primary: prev.colors.primary } 
                : {}),
              ...(prev.colors.accent !== getThemeById(DEFAULT_THEME_ID).colors.accent 
                ? { accent: prev.colors.accent } 
                : {}),
            },
          }));
        }
      } catch (e) {
        // localStorage not available
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchSettings, theme.id]);

  // Load theme from /api/settings on mount (CRITICAL FIX)
  useEffect(() => {
    refreshFromSettings();
  }, [refreshFromSettings]);

  // Apply theme to document root
  useEffect(() => {
    if (isLoading) return; // Don't apply until settings are loaded
    
    const root = document.documentElement;
    const cssVars = themeToCssVars(theme);
    
    // Apply CSS custom properties
    root.setAttribute('style', cssVars);
    
    // Set data attribute for theme ID (useful for CSS selectors)
    root.setAttribute('data-theme', theme.id);
    
    // Set dark/light class for Tailwind dark mode
    const isDarkTheme = isThemeDark(theme);
    root.classList.toggle('dark', isDarkTheme);
    root.classList.toggle('light', !isDarkTheme);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.colors.background);
    }
  }, [theme, isLoading]);

  // Set theme by ID
  const setTheme = useCallback((themeId: string) => {
    const newTheme = getThemeById(themeId);
    setThemeState(prev => ({
      ...newTheme,
      // Preserve custom colors from API settings
      colors: {
        ...newTheme.colors,
        ...(prev.colors.primary !== getThemeById(DEFAULT_THEME_ID).colors.primary 
          ? { primary: prev.colors.primary } 
          : {}),
        ...(prev.colors.accent !== getThemeById(DEFAULT_THEME_ID).colors.accent 
          ? { accent: prev.colors.accent } 
          : {}),
      },
    }));
    
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
      } as ThemeColors,
      fonts: {
        ...prev.fonts,
        ...customTheme.fonts,
      } as ThemeFonts,
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
    refreshFromSettings,
    isLoading,
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
