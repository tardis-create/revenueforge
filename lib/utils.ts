// Utility functions for RevenueForge

export function generateId(prefix: string = 'prod'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${random}`;
}

export function parseTechnicalSpecs(specs: string | null): Record<string, string> | null {
  if (!specs) return null;
  try {
    return JSON.parse(specs);
  } catch {
    return null;
  }
}

export function stringifyTechnicalSpecs(specs: Record<string, string> | null): string | null {
  if (!specs || Object.keys(specs).length === 0) return null;
  return JSON.stringify(specs);
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
