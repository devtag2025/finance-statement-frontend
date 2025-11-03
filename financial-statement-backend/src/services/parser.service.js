const { toNumber } = require('../utils/num');
const { parseRules } = require('../config/parseRules');

class ParserService {
  constructor(rules = parseRules) {
    this.rules = rules;
    this.seenKeys = new Set();
  }

  /**
   * Extract fields from document pages
   * @param {Array} pages - Array of page objects with text content
   * @returns {Array} Extracted fields
   */
  extractFields(pages) {
    const fields = [];

    for (const page of pages) {
      const pageNum = page.page || 1;
      const text = String(page.text || '').trim();

      if (!text) continue;

      const pageFields = this.extractFieldsFromPage(text, pageNum);
      fields.push(...pageFields);
    }

    return fields.length > 0 ? fields : this.createFallbackField();
  }

  /**
   * Extract fields from a single page
   * @private
   */
  extractFieldsFromPage(text, pageNum) {
    const fields = [];

    for (const anchor of this.rules.anchors) {
      // Skip if we've already found this field
      if (this.seenKeys.has(anchor.key)) continue;

      const match = this.findFirstMatch(anchor.labels, text);
      if (!match) continue;

      const field = this.extractFieldValue(anchor, match, text, pageNum);
      if (field) {
        fields.push(field);
        this.seenKeys.add(anchor.key);
      }
    }

    return fields;
  }

  /**
   * Find first matching pattern in text
   * @private
   */
  findFirstMatch(patterns, text) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          text: match[0],
          index: match.index
        };
      }
    }
    return null;
  }

  /**
   * Extract field value based on anchor type
   * @private
   */
  extractFieldValue(anchor, match, text, pageNum) {
    const searchStart = match.index + match.text.length;
    let extraction = null;

    // Try date extraction for period fields
    if (this.isPeriodField(anchor.key)) {
      extraction = this.extractDate(text, searchStart);
      if (extraction) {
        return this.createField(anchor, extraction, 'date', pageNum);
      }
    }

    // Try number extraction
    extraction = this.extractNumber(text, searchStart);
    if (extraction) {
      return this.createField(anchor, extraction, 'currency', pageNum);
    }

    // Return empty field if no value found
    return this.createField(anchor, { value: '', raw: null }, 'text', pageNum);
  }

  /**
   * Check if field is a period/date field
   * @private
   */
  isPeriodField(key) {
    return key.includes('period.');
  }

  /**
   * Extract date from text starting at given index
   * @private
   */
  extractDate(text, startIdx) {
    const window = this.rules.window;
    const slice = text.slice(startIdx, startIdx + window);
    const match = slice.match(this.rules.datePattern);

    if (!match) return null;

    return {
      value: match[1],
      raw: match[1],
      offset: startIdx + match.index
    };
  }

  /**
   * Extract number from text starting at given index
   * @private
   */
  extractNumber(text, startIdx) {
    const window = this.rules.window;
    const slice = text.slice(startIdx, startIdx + window);
    const match = slice.match(this.rules.numberPattern);

    if (!match) return null;

    const raw = match[0];
    const value = toNumber(raw);

    if (value === null) return null;

    return {
      value,
      raw,
      offset: startIdx + match.index
    };
  }

  /**
   * Create field object
   * @private
   */
  createField(anchor, extraction, type, pageNum) {
    const { value, raw } = extraction;
    const confidence = this.calculateConfidence(value, raw, type);

    return {
      id: `${anchor.key}@p${pageNum}`,
      key: anchor.key,
      label: this.formatLabel(anchor.key),
      value: value === null || value === '' ? '' : value,
      type,
      included: true,
      confidence,
      page: pageNum,
      ...(raw && { rawText: raw })
    };
  }

  /**
   * Calculate confidence score for extracted value
   * @private
   */
  calculateConfidence(value, raw, type) {
    if (!value || value === '') return 0.4;
    if (type === 'date') return 0.85;

    let confidence = 0.6;

    // Boost confidence for well-formatted numbers
    if (raw) {
      if (/[.,]/.test(raw)) confidence += 0.1;
      if (/\(/.test(raw)) confidence += 0.05; // Negative numbers in parentheses
      if (raw.replace(/\D/g, '').length >= 5) confidence += 0.1;
    }

    return Math.min(confidence, 0.95);
  }

  /**
   * Format key into human-readable label
   * @private
   */
  formatLabel(key) {
    return key
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' - ');
  }

  /**
   * Create fallback field when no data is extracted
   * @private
   */
  createFallbackField() {
    return [{
      id: 'hint.manual',
      key: 'hint.manual',
      label: 'Manual Entry Required',
      value: '',
      type: 'text',
      included: true,
      confidence: 0.3,
      page: 1,
      message: 'No data could be automatically extracted. Please enter values manually.'
    }];
  }
   static isLoss(raw) {
    if (!raw) return false;
    return /\(.*\)/.test(raw) || /\bL\b\s*$/.test(raw);
  }

  /**
   * Extract ABN/TFN numbers
   * @param {string} text - Document text
   * @param {number} startIdx - Start index
   * @returns {object|null}
   */
  static extractBusinessNumber(text, startIdx, pattern) {
    const window = 100;
    const slice = text.slice(startIdx, startIdx + window);
    const match = slice.match(pattern);

    if (!match) return null;

    return {
      value: match[0].replace(/\s/g, ''),
      raw: match[0],
      offset: startIdx + match.index
    };
  }

  /**
   * Smart value extraction that handles context
   * @param {string} text - Full text
   * @param {number} index - Anchor match index
   * @param {string} key - Field key
   * @returns {object}
   */
  static extractSmartValue(text, index, key) {
    // For ABN/TFN, use special extraction
    if (key === 'business.abn') {
      return this.extractBusinessNumber(
        text, 
        index, 
        parseRules.abnPattern
      );
    }
    if (key === 'business.tfn') {
      return this.extractBusinessNumber(
        text, 
        index, 
        parseRules.tfnPattern
      );
    }

    // Default to regular extraction
    return null;
  }

  /**
   * Post-process extracted value
   * @param {any} value - Extracted value
   * @param {string} raw - Raw text
   * @param {string} key - Field key
   * @returns {any}
   */
  static postProcessValue(value, raw, key) {
    // Handle losses (negative values)
    if (typeof value === 'number' && this.isLoss(raw)) {
      return -Math.abs(value);
    }

    // Format ABN/TFN
    if ((key === 'business.abn' || key === 'business.tfn') && value) {
      return value.replace(/\s/g, '');
    }

    return value;
  }
}

module.exports = ParserService;
