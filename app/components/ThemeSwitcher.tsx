'use client';

import { useState } from 'react';
import { useTheme } from '@/lib/theme-context';
import { cn } from '@/lib/cn';

interface ThemeSwitcherProps {
  // Show as compact button with dropdown
  variant?: 'dropdown' | 'grid' | 'inline';
  // Additional classes
  className?: string;
}

export function ThemeSwitcher({ 
  variant = 'dropdown',
  className 
}: ThemeSwitcherProps) {
  const { theme, themes, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'inline') {
    return (
      <div className={cn('flex gap-2 flex-wrap', className)}>
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              'border border-[var(--border)]',
              theme.id === t.id
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--secondary)]'
            )}
            title={t.description}
          >
            {t.name}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={cn('grid grid-cols-2 sm:grid-cols-3 gap-3', className)}>
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              'p-4 rounded-xl transition-all text-left',
              'border-2',
              theme.id === t.id
                ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-5 h-5 rounded-full border border-white/20"
                style={{ backgroundColor: t.colors.primary }}
              />
              <span className="font-medium text-[var(--foreground)]">
                {t.name}
              </span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">
              {t.description}
            </p>
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant (default)
  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'bg-[var(--card)] border border-[var(--border)]',
          'hover:bg-[var(--secondary)] transition-colors',
          'text-[var(--foreground)]'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div
          className="w-4 h-4 rounded-full border border-white/20"
          style={{ backgroundColor: theme.colors.primary }}
        />
        <span className="text-sm font-medium">{theme.name}</span>
        <svg
          className={cn(
            'w-4 h-4 ml-auto transition-transform',
            isOpen && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={cn(
              'absolute right-0 mt-2 w-56 z-50',
              'bg-[var(--card)] border border-[var(--border)] rounded-xl',
              'shadow-lg shadow-black/20',
              'overflow-hidden'
            )}
            role="listbox"
          >
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3',
                  'hover:bg-[var(--secondary)] transition-colors',
                  'text-left',
                  theme.id === t.id && 'bg-[var(--primary)]/10'
                )}
                role="option"
                aria-selected={theme.id === t.id}
              >
                <div
                  className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0"
                  style={{ backgroundColor: t.colors.primary }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[var(--foreground)]">
                    {t.name}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)] truncate">
                    {t.description}
                  </div>
                </div>
                {theme.id === t.id && (
                  <svg
                    className="w-4 h-4 text-[var(--primary)]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
