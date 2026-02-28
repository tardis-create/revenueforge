// Email Automation Types

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  description?: string;
  variables: string[];       // List of variable names like ["user_name", "company_name"]
  event_trigger?: string;    // e.g. "user.registered", "quote.created"
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailQueueItem {
  id: string;
  template_id?: string;
  to_email: string;
  to_name?: string;
  subject: string;
  body: string;              // Rendered HTML body
  variables: Record<string, string>;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  max_attempts: number;
  error?: string;
  scheduled_at: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  queue_id?: string;
  template_id?: string;
  to_email: string;
  subject: string;
  status: 'sent' | 'failed';
  provider?: string;
  provider_message_id?: string;
  error?: string;
  sent_at: string;
}

export interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  templateId?: string;
  queueId?: string;
}

export interface TriggerEmailOptions {
  event: string;
  to: string;
  toName?: string;
  variables?: Record<string, string>;
}

export type EmailEvent =
  | 'user.registered'
  | 'user.password_reset'
  | 'quote.created'
  | 'quote.approved'
  | 'rfq.submitted'
  | 'dealer.approved'
  | 'dealer.rejected';
