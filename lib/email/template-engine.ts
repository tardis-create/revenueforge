// Simple template engine for email variable substitution
// Supports {{variable_name}} syntax

/**
 * Render a template string by replacing {{variables}} with values
 */
export function renderTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}

/**
 * Extract variable names from a template string
 */
export function extractVariables(template: string): string[] {
  const matches = template.matchAll(/\{\{(\w+)\}\}/g);
  const vars = new Set<string>();
  for (const match of matches) {
    vars.add(match[1]);
  }
  return Array.from(vars);
}

/**
 * Validate that all required variables are provided
 */
export function validateVariables(
  template: string,
  provided: Record<string, string>
): { valid: boolean; missing: string[] } {
  const required = extractVariables(template);
  const missing = required.filter((v) => !(v in provided));
  return { valid: missing.length === 0, missing };
}

/**
 * Generate sample data for template preview
 */
export function generateSampleData(variables: string[]): Record<string, string> {
  const samples: Record<string, string> = {
    user_name: 'John Doe',
    customer_name: 'Acme Corp',
    dealer_name: 'Best Dealer Ltd',
    company_name: 'RevenueForge',
    login_url: 'https://app.revenueforge.com/login',
    portal_url: 'https://app.revenueforge.com/dealer',
    quote_url: 'https://app.revenueforge.com/quotes/Q-001',
    reset_url: 'https://app.revenueforge.com/reset?token=sample',
    support_email: 'support@revenueforge.com',
    account_manager_email: 'manager@revenueforge.com',
    quote_number: 'Q-2026-001',
    rfq_number: 'RFQ-2026-001',
    dealer_code: 'DLR-001',
    total_amount: '$12,500.00',
    valid_until: '2026-03-31',
    submitted_at: new Date().toLocaleDateString(),
    response_time: '2',
    expiry: '24 hours',
  };

  const result: Record<string, string> = {};
  for (const v of variables) {
    result[v] = samples[v] ?? `[${v}]`;
  }
  return result;
}
