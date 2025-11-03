const CalculationService = require('../services/calc.service');
const { calcRules } = require('../config/calcRules');
const logger = require('../config/logger');

exports.calc = async (req, res) => {
  try {
    const { fields, ruleVersion, precision = 2 } = req.body;
    const version = ruleVersion || calcRules.defaultVersion;

    // Validate rule version exists
    if (!calcRules.versions[version]) {
      return res.status(422).json({
        ok: false,
        error: 'INVALID_RULE_VERSION',
        message: `Rule version '${version}' not found`,
        availableVersions: Object.keys(calcRules.versions)
      });
    }

    const calculator = new CalculationService(version);
    const result = calculator.compute(fields);

    if (!result.ok) {
      return res.status(422).json(result);
    }

    // Round results for presentation
    const rounded = calculator.roundResults(result.results, precision);

    return res.json({
      ok: true,
      results: rounded,
      trace: result.trace,
      metadata: {
        ruleVersion: version,
        fieldsProcessed: fields.length,
        fieldsIncluded: fields.filter(f => f.included !== false).length,
        calculationsPerformed: Object.keys(result.results).length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Calculation error:', error);
    return res.status(500).json({
      ok: false,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred during calculation'
    });
  }
};