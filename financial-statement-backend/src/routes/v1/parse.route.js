const express = require('express');
const { parseDocument } = require('../../controllers/parse.controller');
const { validateParseRequest } = require('../../middlewares/validation');
const router = express.Router();

router.post(
  '/',
  express.json({ limit: '2mb' }),
  validateParseRequest,
  parseDocument
);

module.exports = router;