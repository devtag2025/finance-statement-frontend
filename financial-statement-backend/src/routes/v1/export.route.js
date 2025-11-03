// src/routes/v1/export.route.js
const express = require('express');
const requireAuth = require('../../middlewares/requireAuth');
const enforceEntitlements = require('../../middlewares/enforceEntitlements');
const { exportHandler } = require('../../controllers/export.controller');
const router = express.Router();

// Middleware to disable compression for this route
const disableCompression = (req, res, next) => {
  req.noCompress = true;
  next();
};

router.post(
  '/',
  disableCompression, // Add this before other middleware
  requireAuth,
  express.json({ limit: '2mb' }),
  enforceEntitlements({ requireActive: true, precheckExports: 1 }),
  async (req, res) => {
    // Count usage only for successful (2xx) responses
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300 && typeof req._writeUsage === 'function') {
        try { await req._writeUsage({ exports: 1 }); } catch (_) {}
      }
    });
    
    // Delegate to controller
    return exportHandler(req, res);
  }
);

module.exports = router;