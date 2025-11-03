// ============================================
// services/export.service.js
// ============================================
const PDFDocument = require('pdfkit');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

// Constants
const LAYOUT = {
  PAGE_WIDTH: 595.28, // A4 width in points
  PAGE_HEIGHT: 841.89, // A4 height in points
  MARGIN: { top: 60, bottom: 70, left: 50, right: 50 },
  FONTS: {
    NORMAL: 'Helvetica',
    BOLD: 'Helvetica-Bold'
  },
  COLORS: {
    TEXT: '#333333',
    LIGHT_TEXT: '#666666',
    BORDER: '#cccccc',
    SEPARATOR: '#e0e0e0'
  }
};

/**
 * Stream a PDF document with financial data
 * @param {Response} res - Express response object
 * @param {Array} fields - Parsed fields
 * @param {Object} results - Calculated results
 * @param {Object} options - Additional options
 */
async function streamPDF(res, fields, results, options = {}) {
  const {
    title = 'Financial Statement Report',
    timezone = 'UTC',
    pageSize = 'A4'
  } = options;

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: pageSize,
        margins: LAYOUT.MARGIN,
        bufferPages: true,
        autoFirstPage: false,
        info: {
          Title: title,
          Author: 'Financial Statement System',
          Subject: 'Financial Analysis Report',
          CreatedDate: new Date()
        }
      });

      // Add first page manually
      doc.addPage();

      // Handle errors
      doc.on('error', (err) => {
        console.error('PDF document error:', err);
        reject(err);
      });

      res.on('error', (err) => {
        console.error('Response stream error:', err);
        reject(err);
      });

      doc.pipe(res);
      doc.on('end', resolve);

      // Create PDF content
      generatePDFContent(doc, fields, results, { title, timezone });

      // Add footers
      addPageNumbers(doc);

      // Finalize
      doc.end();

    } catch (error) {
      console.error('PDF generation error:', error);
      if (!res.headersSent) {
        res.status(500).json({ ok: false, error: 'PDF_GENERATION_FAILED' });
      }
      reject(error);
    }
  });
}

/**
 * Generate all PDF content
 */
function generatePDFContent(doc, fields, results, options) {
  const { title, timezone } = options;
  
  // Header
  addDocumentHeader(doc, title, timezone);
  doc.moveDown(2);

  // Summary Section
  addSection(doc, 'Executive Summary', [
    { label: 'Total Income', key: 'income.total', format: 'currency' },
    { label: 'Total Expenses', key: 'expenses.total', format: 'currency' },
    { label: 'Net Profit/Loss', key: 'profit.beforeTax', format: 'currency' },
    { label: 'Taxable Income', key: 'tax.taxableIncome', format: 'currency' }
  ], results);

  doc.moveDown(1.5);

  // Income & Expenses
  addSection(doc, 'Income & Expenses Breakdown', [
    { label: 'Operating Income', key: 'income.total', format: 'currency' },
    { label: 'Cost of Sales', key: 'expenses.costofsales', format: 'currency' },
    { label: 'Gross Profit', key: 'profit.gross', format: 'currency' },
    { type: 'separator' },
    { label: 'Wages & Salaries', key: 'expenses.wages', format: 'currency' },
    { label: 'Superannuation', key: 'expenses.superannuation', format: 'currency' },
    { label: 'Rent', key: 'expenses.rent', format: 'currency' },
    { label: 'Depreciation', key: 'depreciation.total', format: 'currency' },
    { label: 'Repairs & Maintenance', key: 'expenses.repairs', format: 'currency' },
    { label: 'Other Expenses', key: 'expenses.other', format: 'currency' },
    { type: 'separator' },
    { label: 'Operating Profit', key: 'profit.operating', format: 'currency', bold: true }
  ], results);

  doc.moveDown(1.5);

  // Tax Section
  addSection(doc, 'Tax Calculation', [
    { label: 'Profit Before Tax', key: 'profit.beforeTax', format: 'currency' },
    { label: 'Add: Non-Deductible Expenses', key: 'tax.addbacks', format: 'currency' },
    { label: 'Less: Other Deductions', key: 'tax.deductions', format: 'currency' },
    { type: 'separator' },
    { label: 'Taxable Income', key: 'tax.taxableIncome', format: 'currency', bold: true },
    { label: 'Tax Expense', key: 'tax.expense', format: 'currency' },
    { label: 'Tax Payable', key: 'tax.payable', format: 'currency' },
    { label: 'Tax Losses Carried Forward', key: 'tax.lossCarryForward', format: 'currency' }
  ], results);

  doc.moveDown(1.5);

  // Balance Sheet (if data exists)
  if (hasBalanceSheetData(results)) {
    addSection(doc, 'Balance Sheet Summary', [
      { label: 'ASSETS', type: 'header' },
      { label: 'Current Assets', key: 'assets.current', format: 'currency' },
      { label: 'Non-Current Assets', key: 'assets.nonCurrent', format: 'currency' },
      { label: 'Total Assets', key: 'assets.total', format: 'currency', bold: true },
      { type: 'separator' },
      { label: 'LIABILITIES', type: 'header' },
      { label: 'Current Liabilities', key: 'liabilities.current', format: 'currency' },
      { label: 'Non-Current Liabilities', key: 'liabilities.nonCurrent', format: 'currency' },
      { label: 'Total Liabilities', key: 'liabilities.total', format: 'currency', bold: true },
      { type: 'separator' },
      { label: 'EQUITY', type: 'header' },
      { label: 'Total Equity', key: 'equity.total', format: 'currency', bold: true }
    ], results);
    
    doc.moveDown(1.5);
  }

  // Ratios
  addSection(doc, 'Financial Ratios & KPIs', [
    { label: 'Profit Margin', key: 'ratio.profitMargin', format: 'percentage' },
    { label: 'Gross Margin', key: 'ratio.grossMargin', format: 'percentage' },
    { label: 'Expense Ratio', key: 'ratio.expenseRatio', format: 'percentage' },
    { label: 'Current Ratio', key: 'ratio.currentRatio', format: 'decimal' },
    { label: 'Debt to Equity', key: 'ratio.debtToEquity', format: 'decimal' },
    { label: 'Return on Assets (ROA)', key: 'ratio.returnOnAssets', format: 'percentage' },
    { label: 'Return on Equity (ROE)', key: 'ratio.returnOnEquity', format: 'percentage' },
    { label: 'Wage Cost Ratio', key: 'kpi.wageCostRatio', format: 'percentage' }
  ], results);

  // Detailed Fields Table
  doc.addPage();
  addFieldsTable(doc, fields);
}

/**
 * Add document header
 */
function addDocumentHeader(doc, title, tz) {
  const now = dayjs().tz(tz).format('MMMM DD, YYYY [at] HH:mm:ss z');
  
  doc
    .fontSize(24)
    .font(LAYOUT.FONTS.BOLD)
    .fillColor(LAYOUT.COLORS.TEXT)
    .text(title, { align: 'center' })
    .moveDown(0.5)
    .fontSize(10)
    .font(LAYOUT.FONTS.NORMAL)
    .fillColor(LAYOUT.COLORS.LIGHT_TEXT)
    .text(`Generated on ${now}`, { align: 'center' })
    .moveDown(0.5);
    
  // Horizontal line
  doc
    .strokeColor(LAYOUT.COLORS.BORDER)
    .lineWidth(1)
    .moveTo(LAYOUT.MARGIN.left, doc.y)
    .lineTo(LAYOUT.PAGE_WIDTH - LAYOUT.MARGIN.right, doc.y)
    .stroke();
}

/**
 * Add a section with title and data rows
 */
function addSection(doc, sectionTitle, items, results) {
  // Check if section will fit on current page
  const estimatedHeight = 30 + (items.length * 20);
  if (doc.y + estimatedHeight > LAYOUT.PAGE_HEIGHT - LAYOUT.MARGIN.bottom) {
    doc.addPage();
  }

  // Section title
  doc
    .fontSize(14)
    .font(LAYOUT.FONTS.BOLD)
    .fillColor(LAYOUT.COLORS.TEXT)
    .text(sectionTitle);
  
  doc.moveDown(0.5);

  const startY = doc.y;
  drawDataRows(doc, items, results, startY);
}

/**
 * Draw data rows for a section
 */
function drawDataRows(doc, items, results, startY) {
  let y = startY;
  const leftX = LAYOUT.MARGIN.left + 20;
  const rightX = LAYOUT.PAGE_WIDTH - LAYOUT.MARGIN.right - 20;
  const valueWidth = 150;
  const maxY = LAYOUT.PAGE_HEIGHT - LAYOUT.MARGIN.bottom - 20;

  for (const item of items) {
    // Check for page break
    if (y + 25 > maxY) {
      doc.addPage();
      y = LAYOUT.MARGIN.top + 20;
    }

    // Separator line
    if (item.type === 'separator') {
      y += 5;
      doc
        .strokeColor(LAYOUT.COLORS.SEPARATOR)
        .lineWidth(0.5)
        .moveTo(leftX, y)
        .lineTo(rightX, y)
        .stroke();
      y += 10;
      continue;
    }

    // Header row
    if (item.type === 'header') {
      doc
        .fontSize(11)
        .font(LAYOUT.FONTS.BOLD)
        .fillColor(LAYOUT.COLORS.TEXT);
      
      // Save current position and draw text
      const savedY = doc.y;
      doc.y = y;
      doc.text(item.label, leftX, y, { lineBreak: false, continued: false });
      doc.y = savedY;
      
      y += 22;
      continue;
    }

    // Data row
    if (item.label) {
      const value = getValue(results, item.key);
      const displayValue = formatValue(value, item.format);
      const font = item.bold ? LAYOUT.FONTS.BOLD : LAYOUT.FONTS.NORMAL;
      const fontSize = item.bold ? 11 : 10;

      // Draw label on left
      doc
        .fontSize(fontSize)
        .font(font)
        .fillColor(LAYOUT.COLORS.TEXT);
      
      const savedY = doc.y;
      doc.y = y;
      doc.text(item.label, leftX, y, { lineBreak: false, continued: false });
      
      // Draw value on right (at same Y position)
      doc.text(displayValue, rightX - valueWidth, y, { 
        width: valueWidth, 
        align: 'right', 
        lineBreak: false,
        continued: false
      });
      
      doc.y = savedY;

      y += 18;
    }
  }

  doc.y = y;
}

/**
 * Add detailed fields table
 */
function addFieldsTable(doc, fields) {
  doc
    .fontSize(14)
    .font(LAYOUT.FONTS.BOLD)
    .fillColor(LAYOUT.COLORS.TEXT)
    .text('Extracted Fields Detail');
  
  doc.moveDown(0.5);

  const includedFields = fields.filter(f => f.included !== false);
  
  if (includedFields.length === 0) {
    doc.fontSize(10).text('No fields were included in the analysis.', { align: 'center' });
    return;
  }

  const colWidths = [200, 120, 80, 60];
  const startX = LAYOUT.MARGIN.left + 20;
  let y = doc.y + 10;

  // Draw header
  y = drawTableHeader(doc, startX, y, colWidths);
  y += 15;

  // Draw rows
  for (const field of includedFields) {
    if (y + 25 > LAYOUT.PAGE_HEIGHT - LAYOUT.MARGIN.bottom) {
      doc.addPage();
      y = LAYOUT.MARGIN.top;
      y = drawTableHeader(doc, startX, y, colWidths);
      y += 15;
    }

    const row = [
      formatLabel(field.label || field.key),
      formatFieldValue(field.value, field.type),
      `${Math.round((field.confidence || 0) * 100)}%`,
      String(field.page || 1)
    ];

    y = drawTableRow(doc, startX, y, row, colWidths);
    y += 20;
  }
}

/**
 * Draw table header
 */
function drawTableHeader(doc, x, y, widths) {
  const headers = ['Field', 'Value', 'Confidence', 'Page'];
  
  doc.fontSize(10).font(LAYOUT.FONTS.BOLD).fillColor(LAYOUT.COLORS.TEXT);

  let currentX = x;
  headers.forEach((header, i) => {
    const align = i === 0 ? 'left' : 'right';
    doc.text(header, currentX, y, { width: widths[i] - 10, align, lineBreak: false });
    currentX += widths[i];
  });

  // Underline
  doc
    .strokeColor(LAYOUT.COLORS.TEXT)
    .lineWidth(1)
    .moveTo(x, y + 12)
    .lineTo(x + widths.reduce((a, b) => a + b, 0), y + 12)
    .stroke();

  return y + 12;
}

/**
 * Draw table row
 */
function drawTableRow(doc, x, y, cells, widths) {
  doc.fontSize(9).font(LAYOUT.FONTS.NORMAL).fillColor(LAYOUT.COLORS.TEXT);

  let currentX = x;
  cells.forEach((cell, i) => {
    const align = i === 0 ? 'left' : 'right';
    doc.text(cell, currentX, y, { width: widths[i] - 10, align, lineBreak: false });
    currentX += widths[i];
  });

  return y;
}

/**
 * Add page numbers to all pages
 */
function addPageNumbers(doc) {
  const range = doc.bufferedPageRange();
  const totalPages = range.count;

  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    
    doc
      .fontSize(8)
      .font(LAYOUT.FONTS.NORMAL)
      .fillColor(LAYOUT.COLORS.LIGHT_TEXT)
      .text(
        `Page ${i + 1} of ${totalPages}`,
        LAYOUT.MARGIN.left,
        LAYOUT.PAGE_HEIGHT - LAYOUT.MARGIN.bottom + 20,
        { width: LAYOUT.PAGE_WIDTH - LAYOUT.MARGIN.left - LAYOUT.MARGIN.right, align: 'center', lineBreak: false }
      );
  }
}

/**
 * Get value from results object (supports dot notation)
 */
function getValue(obj, key) {
  if (!key || !obj) return null;
  
  // Try direct access first
  if (obj.hasOwnProperty(key)) {
    return obj[key];
  }
  
  // Try nested access
  const keys = key.split('.');
  let value = obj;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return null;
    }
  }
  
  return value;
}

/**
 * Format value based on type
 */
function formatValue(value, format) {
  if (value === null || value === undefined) {
    return format === 'percentage' ? '0.00%' : format === 'currency' ? '$0.00' : '0.00';
  }

  if (value === 0) {
    return format === 'percentage' ? '0.00%' : format === 'currency' ? '$0.00' : '0.00';
  }

  switch (format) {
    case 'currency':
      return formatCurrency(value);
    case 'percentage':
      return `${value.toFixed(2)}%`;
    case 'decimal':
      return value.toFixed(2);
    default:
      return String(value);
  }
}

/**
 * Format currency
 */
function formatCurrency(value) {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const formatted = absValue.toLocaleString('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return isNegative ? `(${formatted})` : formatted;
}

/**
 * Format label
 */
function formatLabel(label) {
  return label
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\./g, ' - ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format field value
 */
function formatFieldValue(value, type) {
  if (value === null || value === undefined || value === '') return 'N/A';
  
  if (type === 'currency') {
    return formatCurrency(Number(value));
  }
  
  return String(value);
}

/**
 * Check if balance sheet data exists
 */
function hasBalanceSheetData(results) {
  return getValue(results, 'assets.total') || 
         getValue(results, 'liabilities.total') || 
         getValue(results, 'equity.total');
}

/**
 * Stream CSV
 */
async function streamCSV(res, fields, results) {
  return new Promise((resolve, reject) => {
    try {
      res.on('error', (err) => {
        console.error('Response stream error:', err);
        reject(err);
      });

      res.write('Section,Item,Value,Unit\n');
      res.write('\n"EXTRACTED FIELDS"\n');
      res.write('Field,Value,Type,Confidence,Page\n');
      
      const includedFields = fields.filter(f => f.included !== false);
      for (const field of includedFields) {
        const label = escapeCsv(formatLabel(field.label || field.key));
        const value = escapeCsv(String(field.value || ''));
        const type = field.type || 'text';
        const confidence = Math.round((field.confidence || 0) * 100);
        const page = field.page || 1;
        
        res.write(`"${label}","${value}",${type},${confidence}%,${page}\n`);
      }

      res.write('\n"CALCULATED RESULTS"\n');
      res.write('Metric,Value,Category\n');

      const categories = {
        income: 'Income',
        expenses: 'Expenses',
        profit: 'Profit',
        tax: 'Tax',
        depreciation: 'Depreciation',
        assets: 'Assets',
        liabilities: 'Liabilities',
        equity: 'Equity',
        ratio: 'Ratios',
        kpi: 'KPIs'
      };

      for (const [key, value] of Object.entries(results)) {
        const category = categories[key.split('.')[0]] || 'Other';
        const label = escapeCsv(formatLabel(key));
        const formattedValue = typeof value === 'number' ? value.toFixed(2) : value;
        
        res.write(`"${label}",${formattedValue},"${category}"\n`);
      }

      res.write('\n"SUMMARY"\n');
      res.write('Item,Value\n');
      
      const summaryItems = [
        ['Total Income', results['income.total']],
        ['Total Expenses', results['expenses.total']],
        ['Net Profit/Loss', results['profit.beforeTax']],
        ['Taxable Income', results['tax.taxableIncome']],
        ['Tax Payable', results['tax.payable']],
        ['Profit Margin', results['ratio.profitMargin'] ? `${results['ratio.profitMargin'].toFixed(2)}%` : 'N/A']
      ];

      for (const [label, value] of summaryItems) {
        const formattedValue = typeof value === 'number' ? value.toFixed(2) : (value || 'N/A');
        res.write(`"${label}",${formattedValue}\n`);
      }

      res.end(() => resolve());
      
    } catch (error) {
      console.error('CSV generation error:', error);
      reject(error);
    }
  });
}

/**
 * Escape CSV values
 */
function escapeCsv(str) {
  if (str == null) return '';
  return String(str).replace(/"/g, '""');
}

module.exports = {
  streamPDF,
  streamCSV
};