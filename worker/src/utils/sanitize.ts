/**
 * Input sanitization utilities.
 * Strips HTML tags from string inputs to prevent XSS injection in stored data.
 */

/**
 * Strip HTML tags from a string.
 * Replaces <tag> patterns with empty string.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitize a plain object's string fields recursively.
 * Non-string fields are left untouched.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = stripHtml(value);
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}
