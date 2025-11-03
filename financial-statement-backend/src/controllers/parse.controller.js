const ParserService = require('../services/parser.service');
const logger = require('../config/logger');

exports.parseDocument = async (req, res) => {
  try {
    const { pages } = req.body;
    const parser = new ParserService();
    const fields = parser.extractFields(pages);

    return res.json({
      ok: true,
      fields,
      metadata: {
        pagesProcessed: pages.length,
        fieldsExtracted: fields.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Parse error:', error);
    return res.status(500).json({
      ok: false,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while parsing the document'
    });
  }
};