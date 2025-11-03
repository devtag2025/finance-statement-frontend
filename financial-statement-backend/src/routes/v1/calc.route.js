const express = require('express');
const { calc } = require('../../controllers/calc.controller');
//const { validateCalcRequest } = require('../../middleware/validation');
const router = express.Router();

const validateCalcRequest = (req, res, next) => {
  const { fields, ruleVersion } = req.body;

  if (!Array.isArray(fields)) {
    return res.status(400).json({
      ok: false,
      error: 'BAD_REQUEST',
      message: 'Request must include a fields array'
    });
  }

  const invalidFields = fields.filter(f => 
    !f || typeof f !== 'object' || !f.label
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      ok: false,
      error: 'BAD_REQUEST',
      message: 'All fields must be objects with at least a label property'
    });
  }

  if (ruleVersion && typeof ruleVersion !== 'string') {
    return res.status(400).json({
      ok: false,
      error: 'BAD_REQUEST',
      message: 'ruleVersion must be a string'
    });
  }

  next();
};

router.post(
  '/',
  express.json({ limit: '1mb' }),
  validateCalcRequest,
  calc
);

module.exports = router;