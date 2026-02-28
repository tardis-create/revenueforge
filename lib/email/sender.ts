// Email sender - supports Resend API with fallback to console logging
import type { SendEmailOptions } from './types';

interface SmtpConfig {
  resend_api_key?: string;
  smtp_from?: string;
  smtp_from_name?: string;
}

export interface SendResult {
  success: boolean;
  provider: string;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using configured provider (Resend API or log-only fallback)
 */
export async function sendEmail(
  opts: SendEmailOptions,
  config: SmtpConfig
): Promise<SendResult> {
  const { to, toName, subject, html } = opts;
  const fromEmail = config.smtp_from || 'noreply@revenueforge.com';
  const fromName = config.smtp_from_name || 'RevenueForge';
  const from = `${fromName} <${fromEmail}>`;

  // Try Resend API if key is configured
  if (config.resend_api_key) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.resend_api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: toName ? `${toName} <${to}>` : to,
          subject,
          html,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return {
          success: false,
          provider: 'resend',
          error: `Resend API error ${res.status}: ${errText}`,
        };
      }

      const data = await res.json() as { id?: string };
      return {
        success: true,
        provider: 'resend',
        messageId: data.id,
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, provider: 'resend', error: msg };
    }
  }

  // Fallback: log to console (development/no-config mode)
  console.log('[EMAIL SEND - LOG ONLY]', {
    to: toName ? `${toName} <${to}>` : to,
    from,
    subject,
    bodyLength: html.length,
    timestamp: new Date().toISOString(),
  });

  return {
    success: true,
    provider: 'log-only',
    messageId: `log-${Date.now()}`,
  };
}
