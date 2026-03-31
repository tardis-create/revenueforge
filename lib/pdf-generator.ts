import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface QuoteItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  discount_amount: number;
  total: number;
}

export interface Quote {
  id: string;
  rfq_id: string | null;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  valid_until: string;
  created_at: string;
  terms: string;
  notes: string;
  items: QuoteItem[];
}

export interface InvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  discount_amount: number;
  total: number;
}

export interface Invoice {
  id: string;
  quote_id: string | null;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  due_date: string;
  created_at: string;
  paid_date: string | null;
  terms: string;
  notes: string;
  items: InvoiceItem[];
}

export interface ClinicBranding {
  name: string;
  logo?: string; // base64 encoded
  address?: string;
  email?: string;
  phone?: string;
}

export async function generateQuotePDF(
  quote: Quote,
  branding: ClinicBranding
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  // Draw logo if available
  if (branding.logo) {
    try {
      const logoImage = await pdfDoc.embedPng(branding.logo);
      const logoWidth = 100;
      const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
      page.drawImage(logoImage, {
        x: margin,
        y: y - logoHeight,
        width: logoWidth,
        height: Math.min(logoHeight, 80),
      });
      y -= Math.min(logoHeight, 80) + 20;
    } catch (error) {
      console.error('Failed to embed logo:', error);
    }
  }

  // Clinic name
  page.drawText(branding.name || 'RevenueForge', {
    x: margin,
    y: y,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  // Clinic contact info
  if (branding.address) {
    page.drawText(branding.address, {
      x: margin,
      y: y,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 15;
  }
  if (branding.email || branding.phone) {
    const contact = [branding.email, branding.phone].filter(Boolean).join(' | ');
    page.drawText(contact, {
      x: margin,
      y: y,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 15;
  }

  // Quote number and date
  y -= 20;
  page.drawText(`Quote #: ${quote.id}`, {
    x: width - margin - 150,
    y: y,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 20;
  page.drawText(`Date: ${quote.created_at}`, {
    x: width - margin - 150,
    y: y,
    size: 11,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 15;
  page.drawText(`Valid Until: ${quote.valid_until}`, {
    x: width - margin - 150,
    y: y,
    size: 11,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  y -= 30;

  // Bill To section
  page.drawText('Bill To:', {
    x: margin,
    y: y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 20;
  page.drawText(quote.company_name, {
    x: margin,
    y: y,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 15;
  page.drawText(quote.contact_person, {
    x: margin,
    y: y,
    size: 11,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 15;
  page.drawText(quote.email, {
    x: margin,
    y: y,
    size: 11,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 15;
  page.drawText(quote.phone, {
    x: margin,
    y: y,
    size: 11,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  y -= 40;

  // Line items table header
  const tableTop = y;
  const col1 = margin;
  const col2 = margin + 280;
  const col3 = margin + 400;
  const col4 = margin + 470;
  const col5 = margin + 540;

  page.drawText('Item Description', {
    x: col1,
    y: tableTop,
    size: 11,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  page.drawText('Qty', {
    x: col2,
    y: tableTop,
    size: 11,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  page.drawText('Unit Price', {
    x: col3,
    y: tableTop,
    size: 11,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  page.drawText('Discount', {
    x: col4,
    y: tableTop,
    size: 11,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  page.drawText('Total', {
    x: col5,
    y: tableTop,
    size: 11,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  y -= 20;

  // Draw line separator
  page.drawLine({
    start: { x: margin, y: y },
    end: { x: width - margin, y: y },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });

  y -= 15;

  // Line items
  for (const item of quote.items) {
    page.drawText(item.product_name, {
      x: col1,
      y: y,
      size: 10,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    page.drawText(item.quantity.toString(), {
      x: col2,
      y: y,
      size: 10,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    page.drawText(formatCurrency(item.unit_price), {
      x: col3,
      y: y,
      size: 10,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    page.drawText(
      item.discount_percent > 0 ? `${item.discount_percent}%` : '-',
      {
        x: col4,
        y: y,
        size: 10,
        font,
        color: rgb(0.1, 0.1, 0.1),
      }
    );
    page.drawText(formatCurrency(item.total), {
      x: col5,
      y: y,
      size: 10,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 20;
  }

  // Totals section
  y -= 20;
  const totalsX = margin + 350;
  page.drawText('Subtotal:', {
    x: totalsX,
    y: y,
    size: 11,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText(formatCurrency(quote.subtotal), {
    x: col5,
    y: y,
    size: 11,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 15;

  page.drawText(`Tax (${quote.tax_rate}%):`, {
    x: totalsX,
    y: y,
    size: 11,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText(formatCurrency(quote.tax_amount), {
    x: col5,
    y: y,
    size: 11,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 15;

  page.drawLine({
    start: { x: totalsX, y: y },
    end: { x: col5 + 40, y: y },
    thickness: 2,
    color: rgb(0, 0, 0),
  });
  y -= 15;

  page.drawText('Total:', {
    x: totalsX,
    y: y,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  page.drawText(formatCurrency(quote.total_amount), {
    x: col5,
    y: y,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  // Terms and conditions
  y -= 40;
  if (quote.terms) {
    page.drawText('Terms & Conditions:', {
      x: margin,
      y: y,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 15;

    // Word-wrap terms
    const maxWidth = width - 2 * margin;
    const words = quote.terms.split(' ');
    let line = '';

    for (const word of words) {
      const testLine = line + word + ' ';
      const widthTest = font.widthOfTextAtSize(testLine, 10);

      if (widthTest > maxWidth && line !== '') {
        page.drawText(line.trim(), {
          x: margin,
          y: y,
          size: 10,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
        y -= 15;
        line = word + ' ';
      } else {
        line = testLine;
      }
    }

    if (line.trim()) {
      page.drawText(line.trim(), {
        x: margin,
        y: y,
        size: 10,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }
  }

  return await pdfDoc.save();
}

export async function generateInvoicePDF(
  invoice: Invoice,
  branding: ClinicBranding
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  // Draw logo if available
  if (branding.logo) {
    try {
      const logoImage = await pdfDoc.embedPng(branding.logo);
      const logoWidth = 100;
      const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
      page.drawImage(logoImage, {
        x: margin,
        y: y - logoHeight,
        width: logoWidth,
        height: Math.min(logoHeight, 80),
      });
      y -= Math.min(logoHeight, 80) + 20;
    } catch (error) {
      console.error('Failed to embed logo:', error);
    }
  }

  // Clinic name
  page.drawText(branding.name || 'RevenueForge', {
    x: margin,
    y: y,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  // Clinic contact info
  if (branding.address) {
    page.drawText(branding.address, {
      x: margin,
      y: y,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 15;
  }
  if (branding.email || branding.phone) {
    const contact = [branding.email, branding.phone].filter(Boolean).join(' | ');
    page.drawText(contact, {
      x: margin,
      y: y,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 15;
  }

  // Invoice number, date, and due date
  y -= 20;
  page.drawText(`Invoice #: ${invoice.id}`, {
    x: width - margin - 150,
    y: y,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 20;
  page.drawText(`Date: ${invoice.created_at}`, {
    x: width - margin - 150,
    y: y,
    size: 11,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 15;
  page.drawText(`Due Date: ${invoice.due_date}`, {
    x: width - margin - 150,
    y: y,
    size: 11,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 15;

  // Payment status
  const statusColor =
    invoice.status === 'paid'
      ? rgb(0, 0.5, 0)
      : invoice.status === 'overdue'
        ? rgb(0.8, 0.2, 0)
        : rgb(0.5, 0.5, 0.5);
  page.drawText(`Status: ${invoice.status.toUpperCase()}`, {
    x: width - margin - 150,
    y: y,
    size: 11,
    font: boldFont,
    color: statusColor,
  });

  y -= 30;

  // Bill To section
  page.drawText('Bill To:', {
    x: margin,
    y: y,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 20;
  page.drawText(invoice.company_name, {
    x: margin,
    y: y,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 15;
  page.drawText(invoice.contact_person, {
    x: margin,
    y: y,
    size: 11,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 15;
  page.drawText(invoice.email, {
    x: margin,
    y: y,
    size: 11,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 15;
  page.drawText(invoice.phone, {
    x: margin,
    y: y,
    size: 11,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  y -= 40;

  // Line items table header
  const tableTop = y;
  const col1 = margin;
  const col2 = margin + 280;
  const col3 = margin + 400;
  const col4 = margin + 470;
  const col5 = margin + 540;

  page.drawText('Item Description', {
    x: col1,
    y: tableTop,
    size: 11,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  page.drawText('Qty', {
    x: col2,
    y: tableTop,
    size: 11,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  page.drawText('Unit Price', {
    x: col3,
    y: tableTop,
    size: 11,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  page.drawText('Discount', {
    x: col4,
    y: tableTop,
    size: 11,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  page.drawText('Total', {
    x: col5,
    y: tableTop,
    size: 11,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  y -= 20;

  // Draw line separator
  page.drawLine({
    start: { x: margin, y: y },
    end: { x: width - margin, y: y },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });

  y -= 15;

  // Line items
  for (const item of invoice.items) {
    page.drawText(item.product_name, {
      x: col1,
      y: y,
      size: 10,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    page.drawText(item.quantity.toString(), {
      x: col2,
      y: y,
      size: 10,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    page.drawText(formatCurrency(item.unit_price), {
      x: col3,
      y: y,
      size: 10,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    page.drawText(
      item.discount_percent > 0 ? `${item.discount_percent}%` : '-',
      {
        x: col4,
        y: y,
        size: 10,
        font,
        color: rgb(0.1, 0.1, 0.1),
      }
    );
    page.drawText(formatCurrency(item.total), {
      x: col5,
      y: y,
      size: 10,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 20;
  }

  // Totals section
  y -= 20;
  const totalsX = margin + 350;
  page.drawText('Subtotal:', {
    x: totalsX,
    y: y,
    size: 11,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText(formatCurrency(invoice.subtotal), {
    x: col5,
    y: y,
    size: 11,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 15;

  page.drawText(`Tax (${invoice.tax_rate}%):`, {
    x: totalsX,
    y: y,
    size: 11,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText(formatCurrency(invoice.tax_amount), {
    x: col5,
    y: y,
    size: 11,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 15;

  page.drawLine({
    start: { x: totalsX, y: y },
    end: { x: col5 + 40, y: y },
    thickness: 2,
    color: rgb(0, 0, 0),
  });
  y -= 15;

  page.drawText('Total Due:', {
    x: totalsX,
    y: y,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  page.drawText(formatCurrency(invoice.total_amount), {
    x: col5,
    y: y,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  // Terms and conditions
  y -= 40;
  if (invoice.terms) {
    page.drawText('Terms & Conditions:', {
      x: margin,
      y: y,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 15;

    // Word-wrap terms
    const maxWidth = width - 2 * margin;
    const words = invoice.terms.split(' ');
    let line = '';

    for (const word of words) {
      const testLine = line + word + ' ';
      const widthTest = font.widthOfTextAtSize(testLine, 10);

      if (widthTest > maxWidth && line !== '') {
        page.drawText(line.trim(), {
          x: margin,
          y: y,
          size: 10,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
        y -= 15;
        line = word + ' ';
      } else {
        line = testLine;
      }
    }

    if (line.trim()) {
      page.drawText(line.trim(), {
        x: margin,
        y: y,
        size: 10,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }
  }

  return await pdfDoc.save();
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function downloadPDF(
  pdfBytes: Uint8Array,
  filename: string
): void {
  const blob = new Blob([pdfBytes as unknown as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
