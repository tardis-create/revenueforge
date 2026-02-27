'use client';

import { useTheme } from '@/lib/theme-context';
import { cn } from '@/lib/cn';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ 
  className,
  showText = true,
  size = 'md' 
}: LogoProps) {
  const { theme, branding, isDark } = useTheme();
  
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  // Use custom logo if provided
  const logoSrc = isDark ? branding.logoDark : branding.logo;

  if (logoSrc) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <img
          src={logoSrc}
          alt={branding.companyName}
          className={sizeClasses[size]}
        />
        {showText && (
          <span className={cn('font-semibold', textSizeClasses[size])}>
            {branding.companyName}
          </span>
        )}
      </div>
    );
  }

  // Default logo (styled text with primary color)
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div 
        className={cn(
          'rounded-lg flex items-center justify-center font-bold',
          sizeClasses[size],
          size === 'sm' && 'w-6 text-sm',
          size === 'md' && 'w-8 text-lg',
          size === 'lg' && 'w-10 text-xl'
        )}
        style={{ 
          backgroundColor: theme.colors.primary,
          color: theme.colors.primaryForeground 
        }}
      >
        {branding.companyName.charAt(0)}
      </div>
      {showText && (
        <span 
          className={cn('font-semibold', textSizeClasses[size])}
          style={{ color: theme.colors.foreground }}
        >
          {branding.companyName}
        </span>
      )}
    </div>
  );
}

interface BrandingDisplayProps {
  className?: string;
}

export function BrandingDisplay({ className }: BrandingDisplayProps) {
  const { branding, theme } = useTheme();

  return (
    <div className={cn('space-y-4', className)}>
      <Logo size="lg" />
      {branding.tagline && (
        <p 
          className="text-sm"
          style={{ color: theme.colors.mutedForeground }}
        >
          {branding.tagline}
        </p>
      )}
    </div>
  );
}
