import { Hono } from 'hono';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { generateQuotePDF, type QuotePDFData, type PDFSettings, generateInvoicePDF } from '../utils/pdfGenerator';
import type { Env } from '../types';

const pdf = new Hono<{ Bindings: Env }>();

/**
 * GET settings from database
 */
async function getSettings(db: D1Database): Promise<PDFSettings> {
  const rows = await db.prepare(
    'SELECT key, value FROM settings WHERE category IN (\'branding\', \'contact\', \'terms\') OR key IN (\'gst_number\', \'signatory_name\', \'signatory_designation\', \'quote_terms\', \'invoice_terms\')'
  ).all<{ key: string; value: string }>();

  const settings: PDFSettings = {};
  for (const row of rows.results) {
    try {
      (settings as any)[row.key] = JSON.parse(row.value);
    } catch {
      (settings as any)[row.key] = row.value;
    }
  }
  return settings;
}

/**
 * GET quote data for PDF
 */
async function getQuoteForPDF(db: D1Database, quoteId: string): Promise<QuotePDFData | null> {
  const quote = await db.prepare(`
    SELECT 
      q.id, q.rfq_id, q.amount, q.currency, q.validity_days, q.valid_until,
      q.terms, q.status, q.notes,
      q.created_at,
      r.company_name, r.contact_name, r.email, r.phone
    FROM quotes q
    LEFT JOIN rfq_submissions r ON q.rfq_id = r.id
    WHERE q.id = ?
  `).bind(quoteId).first<any>();

  if (!quote) return null;

  // Get quote items
  const itemsResult = await db.prepare(`
    SELECT qi.*, p.name as product_name
    FROM quote_items qi
    LEFT JOIN products p ON qi.product_id = p.id
    WHERE qi.quote_id = ?
    ORDER BY qi.created_at
  `).bind(quoteId).all();

  // Generate quote number from ID
  const quoteNumber = `QT-${quoteId.slice(-6).toUpperCase()}`;

  return {
    id: quote.id,
    quote_number: quoteNumber,
    date: quote.created_at.split('T')[0],
    valid_until: quote.valid_until,
    currency: quote.currency,
    amount: quote.amount,
    status: quote.status,
    terms: quote.terms,
    notes: quote.notes,
    customer: {
      company_name: quote.company_name || 'N/A',
      contact_name: quote.contact_name || 'N/A',
      email: quote.email || 'N/A',
      phone: quote.phone || 'N/A',
    },
    items: (itemsResult.results || []).map((item: any) => ({
      description: item.description,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    })),
  };
}

/**
 * POST /api/quotes/:id/pdf - Generate PDF for a quote
 * Admin only
 */
pdf.post('/quotes/:id', authMiddleware, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const quoteId = c.req.param('id');

    // Get quote data
    const quote = await getQuoteForPDF(db, quoteId);
    if (!quote) {
      return c.json({ success: false, error: 'Quote not found' }, 404);
    }

    // Get settings for branding
    const settings = await getSettings(db);

    // Generate PDF
    const pdfBytes = await generateQuotePDF(quote, settings);

    // Return PDF with appropriate headers
    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quote-${quote.quote_number || quoteId}.pdf"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return c.json({ success: false, error: 'Failed to generate PDF' }, 500);
  }
});

/**
 * POST /api/invoices/:id/pdf - Generate PDF for an invoice
 * Admin only
 */
pdf.post('/invoices/:id', authMiddleware, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const invoiceId = c.req.param('id');

    // For now, reuse quote structure for invoices
    // In future, add dedicated invoices table
    const invoice = await getQuoteForPDF(db, invoiceId);
    if (!invoice) {
      return c.json({ success: false, error: 'Invoice not found' }, 404);
    }

    // Get settings for branding
    const settings = await getSettings(db);

    // Generate PDF as invoice
    const pdfBytes = await generateInvoicePDF(invoice, settings);

    // Return PDF with appropriate headers
    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.quote_number || invoiceId}.pdf"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return c.json({ success: false, error: 'Failed to generate invoice PDF' }, 500);
  }
});

export default pdf;