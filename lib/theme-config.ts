/**
 * White-Label Theming System Configuration
 * 
 * This module defines theme presets and configuration options for the platform.
 * Themes use CSS custom properties for runtime customization.
 */

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  ring: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  logo?: string;
  logoDark?: string;
  companyName?: string;
}

// Default RevenueForge Dark Theme
export const themeDark: ThemeConfig = {
  id: 'dark',
  name: 'RevenueForge Dark',
  description: 'Default dark theme with purple accents',
  companyName: 'RevenueForge',
  colors: {
    background: '#09090b',
    foreground: '#fafafa',
    card: '#18181b',
    cardForeground: '#fafafa',
    primary: '#a855f7',
    primaryForeground: '#fafafa',
    secondary: '#27272a',
    secondaryForeground: '#fafafa',
    muted: '#27272a',
    mutedForeground: '#a1a1aa',
    accent: '#18181b',
    accentForeground: '#fafafa',
    border: '#27272a',
    ring: '#a855f7',
  },
};

// Light Theme
export const themeLight: ThemeConfig = {
  id: 'light',
  name: 'Light',
  description: 'Clean light theme with purple accents',
  companyName: 'RevenueForge',
  colors: {
    background: '#fafafa',
    foreground: '#09090b',
    card: '#ffffff',
    cardForeground: '#09090b',
    primary: '#9333ea',
    primaryForeground: '#fafafa',
    secondary: '#f4f4f5',
    secondaryForeground: '#09090b',
    muted: '#f4f4f5',
    mutedForeground: '#71717a',
    accent: '#f4f4f5',
    accentForeground: '#09090b',
    border: '#e4e4e7',
    ring: '#9333ea',
  },
};

// Midnight Blue Theme
export const themeMidnight: ThemeConfig = {
  id: 'midnight',
  name: 'Midnight Blue',
  description: 'Dark theme with blue accents',
  companyName: 'RevenueForge',
  colors: {
    background: '#0c1222',
    foreground: '#f8fafc',
    card: '#1e293b',
    cardForeground: '#f8fafc',
    primary: '#3b82f6',
    primaryForeground: '#f8fafc',
    secondary: '#334155',
    secondaryForeground: '#f8fafc',
    muted: '#334155',
    mutedForeground: '#94a3b8',
    accent: '#1e293b',
    accentForeground: '#f8fafc',
    border: '#334155',
    ring: '#3b82f6',
  },
};

// Emerald Theme (for eco/green brands)
export const themeEmerald: ThemeConfig = {
  id: 'emerald',
  name: 'Emerald',
  description: 'Dark theme with green accents',
  companyName: 'RevenueForge',
  colors: {
    background: '#0a0f0d',
    foreground: '#f0fdf4',
    card: '#14261e',
    cardForeground: '#f0fdf4',
    primary: '#10b981',
    primaryForeground: '#f0fdf4',
    secondary: '#1a3029',
    secondaryForeground: '#f0fdf4',
    muted: '#1a3029',
    mutedForeground: '#86efac',
    accent: '#14261e',
    accentForeground: '#f0fdf4',
    border: '#1a3029',
    ring: '#10b981',
  },
};

// Corporate Blue Theme
export const themeCorporate: ThemeConfig = {
  id: 'corporate',
  name: 'Corporate',
  description: 'Professional light theme with blue accents',
  companyName: 'RevenueForge',
  colors: {
    background: '#f8fafc',
    foreground: '#1e293b',
    card: '#ffffff',
    cardForeground: '#1e293b',
    primary: '#2563eb',
    primaryForeground: '#f8fafc',
    secondary: '#e2e8f0',
    secondaryForeground: '#1e293b',
    muted: '#e2e8f0',
    mutedForeground: '#64748b',
    accent: '#e2e8f0',
    accentForeground: '#1e293b',
    border: '#e2e8f0',
    ring: '#2563eb',
  },
};

// Warm Orange Theme
export const themeWarm: ThemeConfig = {
  id: 'warm',
  name: 'Warm Sunset',
  description: 'Dark theme with warm orange accents',
  companyName: 'RevenueForge',
  colors: {
    background: '#0f0a0a',
    foreground: '#fef7ed',
    card: '#1c1410',
    cardForeground: '#fef7ed',
    primary: '#f97316',
    primaryForeground: '#fef7ed',
    secondary: '#2a1f1a',
    secondaryForeground: '#fef7ed',
    muted: '#2a1f1a',
    mutedForeground: '#fdba74',
    accent: '#1c1410',
    accentForeground: '#fef7ed',
    border: '#2a1f1a',
    ring: '#f97316',
  },
};

// All available theme presets
export const themePresets: ThemeConfig[] = [
  themeDark,
  themeLight,
  themeMidnight,
  themeEmerald,
  themeCorporate,
  themeWarm,
];

// Get theme by ID
export function getThemeById(id: string): ThemeConfig {
  return themePresets.find(theme => theme.id === id) || themeDark;
}

// Convert theme colors to CSS custom properties string
export function themeToCssVars(theme: ThemeConfig): string {
  const { colors } = theme;
  const lines = [
    `--background: ${colors.background};`,
    `--foreground: ${colors.foreground};`,
    `--card: ${colors.card};`,
    `--card-foreground: ${colors.cardForeground};`,
    `--primary: ${colors.primary};`,
    `--primary-foreground: ${colors.primaryForeground};`,
    `--secondary: ${colors.secondary};`,
    `--secondary-foreground: ${colors.secondaryForeground};`,
    `--muted: ${colors.muted};`,
    `--muted-foreground: ${colors.mutedForeground};`,
    `--accent: ${colors.accent};`,
    `--accent-foreground: ${colors.accentForeground};`,
    `--border: ${colors.border};`,
    `--ring: ${colors.ring};`,
  ];
  return lines.join(' ');
}

// Theme storage key
export const THEME_STORAGE_KEY = 'rf-theme';

// Default theme ID
export const DEFAULT_THEME_ID = 'dark';
