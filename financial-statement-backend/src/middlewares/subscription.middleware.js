// src/middlewares/subscription.middleware.js
const { canConsumeExport } = require('../services/usage.service');
const User = require('../models/user.model');

async function requireActiveSubscription(req, res, next) {
  const user = await User.findById(req.user?._id);
  if (!user) return res.status(401).json({ ok:false, reason:'UNAUTHENTICATED' });
  if (!user.isSubActive()) return res.status(403).json({ ok:false, reason:'SUBSCRIPTION_REQUIRED' });
  next();
}

async function requireExportCapacity(req, res, next) {
  const check = await canConsumeExport(req.user?._id, 1);
  if (!check.ok) return res.status(402).json({ ok:false, reason:'USAGE_LIMIT', meta: check });
  next();
}

module.exports = { requireActiveSubscription, requireExportCapacity };
