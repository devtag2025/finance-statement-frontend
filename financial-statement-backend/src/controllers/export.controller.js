// src/controllers/export.controller.js
const dayjs = require('dayjs');
const { seen, remember } = require('../utils/idempotency');
const { streamPDF, streamCSV } = require('../services/export.service');

exports.exportHandler = async (req, res) => {
  try {
    const { fields, format, fileName, idempotencyKey } = req.body || {};
    let { results } = req.body;
    if (typeof results === 'string') {
      results = JSON.parse(results);
    }
    console.log('Export request received:', {
      fieldsCount: fields?.length,
      resultsKeys: results ? Object.keys(results).slice(0, 5) : 'null/undefined',
      resultsSample: results ? Object.entries(results).slice(0, 3) : 'null/undefined',
      format,
    });

    // Basic validation
    if (!Array.isArray(fields) || typeof results !== 'object' || !results) {
      return res.status(400).json({ ok: false, reasons: ['BAD_REQUEST'] });
    }

    if (format !== 'pdf' && format !== 'csv') {
      return res.status(400).json({ ok: false, reasons: ['UNSUPPORTED_FORMAT'] });
    }

    if (!idempotencyKey || typeof idempotencyKey !== 'string') {
      return res.status(400).json({ ok: false, reasons: ['IDEMPOTENCY_KEY_REQUIRED'] });
    }

    if (seen(idempotencyKey)) {
      return res.status(409).json({ ok: false, reasons: ['IDEMPOTENT_REPLAY'] });
    }

    remember(idempotencyKey);

    const base = (fileName && String(fileName).replace(/[^\w.-]/g, '')) || 'financial-statement';
    const ts = dayjs().format('YYYYMMDD_HHmmss');

    // Disable compression for file downloads
    res.set('Content-Encoding', 'identity');

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${base}_${ts}.pdf"`);
      res.setHeader('Cache-Control', 'no-cache');

      // Wait for PDF generation to complete
      await streamPDF(res, fields, results, {
        title: 'Financial Statement Results',
        timezone: 'UTC',
      });

      return; // Response already sent by stream
    }

    // CSV
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${base}_${ts}.csv"`);
    res.setHeader('Cache-Control', 'no-cache');

    // Wait for CSV generation to complete
    await streamCSV(res, fields, results);

    return; // Response already sent by stream
  } catch (e) {
    console.error('Export handler error:', e);

    // Only send JSON error if headers haven't been sent yet
    if (!res.headersSent) {
      return res.status(500).json({ ok: false, reasons: ['INTERNAL_ERROR'] });
    }

    // If headers were sent, we can only end the response
    res.end();
  }
};
