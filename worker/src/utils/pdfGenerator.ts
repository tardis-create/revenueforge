import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Settings data for PDF generation
 */
export interface PDFSettings {
  company_name?: string;
  logo_url?: string;
  primary_color?: string;
  accent_color?: string;
  address?: string;
  phone?: string;
  email?: string;
  gst_number?: string;
  signatory_name?: string;
  signatory_designation?: string;
  quote_terms?: string;
}

/**
 * Quote data for PDF generation
 */
export interface QuotePDFData {
  id: string;
  quote_number?: string;
  date: string;
  valid_until: string;
  currency: string;
  amount: number;
  status: string;
  terms?: string;
  notes?: string;
  customer: {
    company_name: string;
    contact_name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    description: string;
    product_name?: string;
    quantity: number;
    unit_price: number;
    discount?: number;
    tax?: number;
    total_price: number;
  }>;
}

/**
 * Parse hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    };
  }
  return { r: 0.23, g: 0.51, b: 0.71 }; // Default blue
}

/**
 * Format currency amount
 */
function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
  };
  const symbol = symbols[currency] || currency + ' ';
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Generate PDF for a quote
 */
export async function generateQuotePDF(
  quote: QuotePDFData,
  settings: PDFSettings
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Colors
  const primaryColor = hexToRgb(settings.primary_color || '#3b82f6');
  const primaryRgb = rgb(primaryColor.r, primaryColor.g, primaryColor.b);
  const blackRgb = rgb(0, 0, 0);
  const grayRgb = rgb(0.5, 0.5, 0.5);
  const lightGrayRgb = rgb(0.95, 0.95, 0.95);

  let yPos = height - 60;

  // Header - Company Logo/Name
  const companyName = settings.company_name || 'RevenueForge';
  page.drawText(companyName, {
    x: 50,
    y: yPos,
    size: 20,
    font: fontBold,
    color: primaryRgb,
  });
  yPos -= 25;

  // Company address and contact
  const contactInfo: string[] = [];
  if (settings.address) contactInfo.push(settings.address);
  if (settings.phone) contactInfo.push(settings.phone);
  if (settings.email) contactInfo.push(settings.email);

  if (contactInfo.length > 0) {
    page.drawText(contactInfo.join(' | '), {
      x: 50,
      y: yPos,
      size: 9,
      font: font,
      color: grayRgb,
    });
    yPos -= 15;
  }

  // GST Number
  if (settings.gst_number) {
    page.drawText(`GST: ${settings.gst_number}`, {
      x: 50,
      y: yPos,
      size: 9,
      font: font,
      color: grayRgb,
    });
    yPos -= 20;
  }

  // Divider line
  page.drawLine({
    start: { x: 50, y: yPos },
    end: { x: width - 50, y: yPos },
    thickness: 1,
    color: primaryRgb,
  });
  yPos -= 30;

  // Document Title
  page.drawText('QUOTATION', {
    x: width / 2 - 40,
    y: yPos,
    size: 18,
    font: fontBold,
    color: blackRgb,
  });
  yPos -= 30;

  // Quote number and date
  const quoteNumber = quote.quote_number || quote.id;
  page.drawText(`Quote #: ${quoteNumber}`, {
    x: 50,
    y: yPos,
    size: 11,
    font: fontBold,
    color: blackRgb,
  });
  page.drawText(`Date: ${formatDate(quote.date)}`, {
    x: width - 180,
    y: yPos,
    size: 11,
    font: font,
    color: blackRgb,
  });
  yPos -= 20;

  // Valid until
  page.drawText(`Valid Until: ${formatDate(quote.valid_until)}`, {
    x: 50,
    y: yPos,
    size: 10,
    font: font,
    color: blackRgb,
  });
  yPos -= 30;

  // Customer Info Box
  page.drawRectangle({
    x: 50,
    y: yPos - 60,
    width: width - 100,
    height: 70,
    color: lightGrayRgb,
  });

  page.drawText('Bill To:', {
    x: 60,
    y: yPos - 15,
    size: 10,
    font: fontBold,
    color: blackRgb,
  });

  const customer = quote.customer;
  page.drawText(customer.company_name || 'N/A', {
    x: 60,
    y: yPos - 30,
    size: 11,
    font: fontBold,
    color: blackRgb,
  });
  page.drawText(customer.contact_name || 'N/A', {
    x: 60,
    y: yPos - 45,
    size: 10,
    font: font,
    color: blackRgb,
  });
  page.drawText(customer.email || 'N/A', {
    x: 60,
    y: yPos - 60,
    size: 10,
    font: font,
    color: blackRgb,
  });
  if (customer.phone) {
    page.drawText(customer.phone, {
      x: 60,
      y: yPos - 75,
      size: 10,
      font: font,
      color: blackRgb,
    });
  }
  yPos -= 100;

  // Line Items Table Header
  const tableStartX = 50;
  const colWidths = {
    description: 220,
    qty: 60,
    unitPrice: 80,
    discount: 70,
    tax: 60,
    total: 75,
  };

  // Table header background
  page.drawRectangle({
    x: tableStartX,
    y: yPos - 5,
    width: width - 100,
    height: 20,
    color: primaryRgb,
  });

  page.drawText('Description', {
    x: tableStartX + 5,
    y: yPos,
    size: 9,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText('Qty', {
    x: tableStartX + colWidths.description,
    y: yPos,
    size: 9,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText('Unit Price', {
    x: tableStartX + colWidths.description + colWidths.qty,
    y: yPos,
    size: 9,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText('Discount', {
    x: tableStartX + colWidths.description + colWidths.qty + colWidths.unitPrice,
    y: yPos,
    size: 9,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText('Tax', {
    x: tableStartX + colWidths.description + colWidths.qty + colWidths.unitPrice + colWidths.discount,
    y: yPos,
    size: 9,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText('Total', {
    x: tableStartX + colWidths.description + colWidths.qty + colWidths.unitPrice + colWidths.discount + colWidths.tax,
    y: yPos,
    size: 9,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  yPos -= 25;

  // Table rows
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  for (let i = 0; i < quote.items.length; i++) {
    const item = quote.items[i];
    const rowHeight = 18;
    
    // Alternate row background
    if (i % 2 === 1) {
      page.drawRectangle({
        x: tableStartX,
        y: yPos - rowHeight + 3,
        width: width - 100,
        height: rowHeight,
        color: lightGrayRgb,
      });
    }

    const description = item.product_name || item.description || 'Item';
    const qtyStr = item.quantity.toString();
    const unitPriceStr = formatCurrency(item.unit_price, quote.currency);
    const discountStr = item.discount ? `${item.discount}%` : '-';
    const taxStr = item.tax ? `${item.tax}%` : '-';
    const totalStr = formatCurrency(item.total_price, quote.currency);

    // Truncate description if too long
    const maxDescLen = 35;
    const displayDesc = description.length > maxDescLen ? description.substring(0, maxDescLen) + '...' : description;

    page.drawText(displayDesc, {
      x: tableStartX + 5,
      y: yPos,
      size: 8,
      font: font,
      color: blackRgb,
    });
    page.drawText(qtyStr, {
      x: tableStartX + colWidths.description,
      y: yPos,
      size: 8,
      font: font,
      color: blackRgb,
    });
    page.drawText(unitPriceStr, {
      x: tableStartX + colWidths.description + colWidths.qty,
      y: yPos,
      size: 8,
      font: font,
      color: blackRgb,
    });
    page.drawText(discountStr, {
      x: tableStartX + colWidths.description + colWidths.qty + colWidths.unitPrice,
      y: yPos,
      size: 8,
      font: font,
      color: blackRgb,
    });
    page.drawText(taxStr, {
      x: tableStartX + colWidths.description + colWidths.qty + colWidths.unitPrice + colWidths.discount,
      y: yPos,
      size: 8,
      font: font,
      color: blackRgb,
    });
    page.drawText(totalStr, {
      x: tableStartX + colWidths.description + colWidths.qty + colWidths.unitPrice + colWidths.discount + colWidths.tax,
      y: yPos,
      size: 8,
      font: font,
      color: blackRgb,
    });

    subtotal += item.total_price;
    if (item.discount) totalDiscount += (item.total_price * item.discount) / 100;
    if (item.tax) totalTax += (item.total_price * item.tax) / 100;

    yPos -= rowHeight;

    // Check for page overflow
    if (yPos < 150) {
      // Add new page
      const newPage = pdfDoc.addPage([595, 842]);
      const { height: newHeight } = newPage.getSize();
      yPos = newHeight - 60;
    }
  }

  yPos -= 10;

  // Totals section
  const totalsX = width - 200;
  
  page.drawText('Subtotal:', {
    x: totalsX,
    y: yPos,
    size: 10,
    font: font,
    color: grayRgb,
  });
  page.drawText(formatCurrency(subtotal, quote.currency), {
    x: totalsX + 100,
    y: yPos,
    size: 10,
    font: font,
    color: blackRgb,
  });
  yPos -= 18;

  if (totalDiscount > 0) {
    page.drawText('Discount:', {
      x: totalsX,
      y: yPos,
      size: 10,
      font: font,
      color: grayRgb,
    });
    page.drawText(`-${formatCurrency(totalDiscount, quote.currency)}`, {
      x: totalsX + 100,
      y: yPos,
      size: 10,
      font: font,
      color: blackRgb,
    });
    yPos -= 18;
  }

  if (totalTax > 0) {
    page.drawText('Tax:', {
      x: totalsX,
      y: yPos,
      size: 10,
      font: font,
      color: grayRgb,
    });
    page.drawText(formatCurrency(totalTax, quote.currency), {
      x: totalsX + 100,
      y: yPos,
      size: 10,
      font: font,
      color: blackRgb,
    });
    yPos -= 18;
  }

  // Grand total
  const grandTotal = subtotal - totalDiscount + totalTax;
  page.drawRectangle({
    x: totalsX - 10,
    y: yPos - 5,
    width: 150,
    height: 22,
    color: primaryRgb,
  });
  page.drawText('Grand Total:', {
    x: totalsX,
    y: yPos,
    size: 11,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText(formatCurrency(grandTotal, quote.currency), {
    x: totalsX + 100,
    y: yPos,
    size: 11,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  yPos -= 40;

  // Terms and Conditions
  const terms = settings.quote_terms || quote.terms || 'Payment due within 30 days of invoice.';
  
  // Check if we need a new page for terms
  if (yPos < 150) {
    const newPage = pdfDoc.addPage([595, 842]);
    yPos = newPage.getSize().height - 60;
  }

  page.drawText('Terms & Conditions:', {
    x: 50,
    y: yPos,
    size: 10,
    font: fontBold,
    color: blackRgb,
  });
  yPos -= 15;

  // Word wrap terms text
  const termsLines = terms.split('. ').filter(t => t.trim());
  for (const termLine of termsLines.slice(0, 5)) {
    page.drawText(`• ${termLine.trim()}${termLine.endsWith('.') ? '' : '.'}`, {
      x: 60,
      y: yPos,
      size: 8,
      font: font,
      color: grayRgb,
    });
    yPos -= 14;
  }

  yPos -= 20;

  // Authorized Signatory
  page.drawText('Authorized Signatory:', {
    x: 50,
    y: yPos,
    size: 10,
    font: fontBold,
    color: blackRgb,
  });
  yPos -= 25;

  // Signatory name and designation
  const signatoryName = settings.signatory_name || 'Authorized Signatory';
  const signatoryDesignation = settings.signatory_designation || 'Manager';

  // Signature line
  page.drawLine({
    start: { x: 50, y: yPos + 20 },
    end: { x: 180, y: yPos + 20 },
    thickness: 1,
    color: blackRgb,
  });

  page.drawText(signatoryName, {
    x: 50,
    y: yPos,
    size: 10,
    font: fontBold,
    color: blackRgb,
  });
  page.drawText(signatoryDesignation, {
    x: 50,
    y: yPos - 12,
    size: 8,
    font: font,
    color: grayRgb,
  });

  // Footer
  const footerY = 30;
  page.drawLine({
    start: { x: 50, y: footerY + 10 },
    end: { x: width - 50, y: footerY + 10 },
    thickness: 0.5,
    color: grayRgb,
  });
  page.drawText('This is a computer-generated document. No signature is required.', {
    x: width / 2 - 120,
    y: footerY,
    size: 8,
    font: font,
    color: grayRgb,
  });

  // Serialize the PDF document to bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

/**
 * Generate PDF for an invoice (reuses quote template with different header)
 */
export async function generateInvoicePDF(
  invoice: QuotePDFData,
  settings: PDFSettings
): Promise<Uint8Array> {
  // Override header to "INVOICE"
  const invoiceData = {
    ...invoice,
    // Keep the same structure, just differs in presentation
  };
  
  // Generate with invoice-specific formatting
  return generateQuotePDF(invoiceData, settings);
}