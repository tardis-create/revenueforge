-- Email Automation System Migration

CREATE TABLE IF NOT EXISTS email_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  description TEXT,
  variables TEXT DEFAULT '[]',
  event_trigger TEXT,
  is_active INTEGER DEFAULT 1,
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_queue (
  id TEXT PRIMARY KEY,
  template_id TEXT,
  to_email TEXT NOT NULL,
  to_name TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables TEXT DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error TEXT,
  scheduled_at TEXT NOT NULL,
  processed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS email_logs (
  id TEXT PRIMARY KEY,
  queue_id TEXT,
  template_id TEXT,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL,
  provider TEXT,
  provider_message_id TEXT,
  error TEXT,
  sent_at TEXT NOT NULL,
  FOREIGN KEY (queue_id) REFERENCES email_queue(id) ON DELETE SET NULL,
  FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON email_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_templates_trigger ON email_templates(event_trigger);

INSERT OR IGNORE INTO email_templates (id, name, subject, body, description, variables, event_trigger, is_active, created_at, updated_at) VALUES
('tpl_welcome','Welcome Email','Welcome to {{company_name}}, {{user_name}}!','<h1>Welcome, {{user_name}}!</h1><p>Thank you for joining {{company_name}}. Your account is now active.</p><p>Login: <a href="{{login_url}}">{{login_url}}</a></p><p>Support: {{support_email}}</p>','Sent when a new user registers','["user_name","company_name","login_url","support_email"]','user.registered',1,datetime(''now''),datetime(''now'')),
('tpl_quote_created','Quote Created','Your Quote #{{quote_number}} is Ready','<h1>Hi {{customer_name}},</h1><p>Your quote <strong>#{{quote_number}}</strong> for <strong>{{total_amount}}</strong> is ready.</p><p>Valid until: {{valid_until}}</p><p><a href="{{quote_url}}">View Quote</a></p>','Sent when a quote is created','["customer_name","quote_number","total_amount","valid_until","quote_url","company_name"]','quote.created',1,datetime(''now''),datetime(''now'')),
('tpl_rfq_received','RFQ Received','We Received Your Request for Quote','<h1>RFQ Received</h1><p>Hi {{customer_name}}, we received your RFQ <strong>{{rfq_number}}</strong> on {{submitted_at}}. We will respond within {{response_time}} business days.</p>','Sent when an RFQ is received','["customer_name","rfq_number","submitted_at","response_time","company_name"]','rfq.submitted',1,datetime(''now''),datetime(''now'')),
('tpl_password_reset','Password Reset','Reset Your {{company_name}} Password','<h1>Password Reset</h1><p>Hi {{user_name}}, click to reset your password: <a href="{{reset_url}}">Reset Password</a>. Expires in {{expiry}}.</p>','Sent on password reset request','["user_name","company_name","reset_url","expiry"]','user.password_reset',1,datetime(''now''),datetime(''now'')),
('tpl_dealer_approved','Dealer Account Approved','Your Dealer Account is Approved!','<h1>Approved!</h1><p>Hi {{dealer_name}}, your dealer account with {{company_name}} is approved. <a href="{{portal_url}}">Access Portal</a>. Code: {{dealer_code}}.</p>','Sent when dealer is approved','["dealer_name","company_name","portal_url","dealer_code","account_manager_email"]','dealer.approved',1,datetime(''now''),datetime(''now''));
