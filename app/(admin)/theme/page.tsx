'use client';

import { useTheme } from '@/lib/theme-context';
import { ThemeSwitcher } from '@/app/components/ThemeSwitcher';
import { Logo, BrandingDisplay } from '@/app/components/Branding';

export default function ThemeSettingsPage() {
  const { theme, branding, setBranding } = useTheme();

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Theme Settings
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Customize the look and feel of your platform
        </p>
      </div>

      {/* Theme Presets */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Color Theme
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Choose a preset color scheme for your platform
        </p>
        <ThemeSwitcher variant="grid" />
      </section>

      {/* Current Theme Preview */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Preview
        </h2>
        <div 
          className="p-6 rounded-xl border border-[var(--border)]"
          style={{ backgroundColor: 'var(--card)' }}
        >
          <div className="flex items-center gap-4 mb-6">
            <Logo size="lg" />
          </div>
          
          <div className="space-y-4">
            {/* Color Swatches */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {Object.entries(theme.colors).map(([name, color]) => (
                <div key={name} className="text-center">
                  <div
                    className="w-full aspect-square rounded-lg mb-2 border border-[var(--border)]"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {name.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              ))}
            </div>

            {/* Sample UI Elements */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                className="px-4 py-2 rounded-lg font-medium"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)'
                }}
              >
                Primary Button
              </button>
              <button
                className="px-4 py-2 rounded-lg font-medium border"
                style={{ 
                  backgroundColor: 'var(--secondary)',
                  color: 'var(--secondary-foreground)',
                  borderColor: 'var(--border)'
                }}
              >
                Secondary Button
              </button>
              <button
                className="px-4 py-2 rounded-lg font-medium"
                style={{ 
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)'
                }}
              >
                Accent Button
              </button>
            </div>

            {/* Sample Card */}
            <div 
              className="p-4 rounded-lg border mt-4"
              style={{ 
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <h3 
                className="font-semibold mb-2"
                style={{ color: 'var(--card-foreground)' }}
              >
                Sample Card
              </h3>
              <p style={{ color: 'var(--muted-foreground)' }}>
                This is how cards will look with the current theme.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Theme Info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Current Theme Info
        </h2>
        <div 
          className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]"
        >
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[var(--muted-foreground)]">Theme ID</dt>
              <dd className="font-mono font-medium text-[var(--foreground)]">
                {theme.id}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted-foreground)]">Theme Name</dt>
              <dd className="font-medium text-[var(--foreground)]">
                {theme.name}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted-foreground)]">Company</dt>
              <dd className="font-medium text-[var(--foreground)]">
                {branding.companyName}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted-foreground)]">Primary Color</dt>
              <dd className="flex items-center gap-2 font-mono text-[var(--foreground)]">
                <span
                  className="w-4 h-4 rounded border border-[var(--border)]"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                {theme.colors.primary}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* White-Label Info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          White-Label Customization
        </h2>
        <div 
          className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]"
        >
          <p className="text-[var(--muted-foreground)] text-sm mb-4">
            For full white-label customization including custom logos, colors, and branding,
            contact your administrator to configure the platform settings.
          </p>
          <div className="flex flex-wrap gap-2">
            <span 
              className="px-2 py-1 text-xs rounded-full"
              style={{ 
                backgroundColor: 'var(--secondary)',
                color: 'var(--secondary-foreground)'
              }}
            >
              Custom Logos
            </span>
            <span 
              className="px-2 py-1 text-xs rounded-full"
              style={{ 
                backgroundColor: 'var(--secondary)',
                color: 'var(--secondary-foreground)'
              }}
            >
              Brand Colors
            </span>
            <span 
              className="px-2 py-1 text-xs rounded-full"
              style={{ 
                backgroundColor: 'var(--secondary)',
                color: 'var(--secondary-foreground)'
              }}
            >
              Custom Domain
            </span>
            <span 
              className="px-2 py-1 text-xs rounded-full"
              style={{ 
                backgroundColor: 'var(--secondary)',
                color: 'var(--secondary-foreground)'
              }}
            >
              Email Branding
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
