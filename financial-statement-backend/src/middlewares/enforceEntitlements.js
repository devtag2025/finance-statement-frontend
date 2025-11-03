// src/middlewares/enforceEntitlements.js
const User = require('../models/user.model');
const { canConsumeExport, recordExport, ensureUsageWindow } = require('../services/usage.service');

/**
 * Options:
 *  - requireActive: boolean (default true) => block if subscription not active/trialing
 *  - precheckExports: number (default 1)  => check capacity for N exports
 */
module.exports = function enforceEntitlements(opts = {}) {
  const { requireActive = true, precheckExports = 1 } = opts;

  return async function (req, res, next) {
    try {
      if (!req.user?._id) {
        return res.status(401).json({ ok: false, reason: 'UNAUTHENTICATED' });
      }

      // Load fresh user
      const user = await User.findById(req.user._id);
      if (!user) return res.status(401).json({ ok: false, reason: 'UNAUTHENTICATED' });

      // Ensure usage window exists (e.g., Stripe period or calendar month)
      await ensureUsageWindow(user);

      if (requireActive && !(user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing')) {
        return res.status(403).json({ ok: false, reason: 'SUBSCRIPTION_REQUIRED' });
      }

      // Capacity pre-check
      const cap = await canConsumeExport(user._id, precheckExports);
      if (!cap.ok) {
        // 402 is "Payment Required" – commonly used for quota exceeded
        return res.status(402).json({ ok: false, reason: 'USAGE_LIMIT', meta: cap });
      }

      // Provide a safe usage writer to the downstream handler
      req._writeUsage = async ({ exports: n = precheckExports } = {}) => {
        try { await recordExport(user._id, n); } catch (e) { /* swallow */ }
      };

      next();
    } catch (e) {
      return res.status(500).json({ ok: false, reason: 'ENTITLEMENTS_ERROR' });
    }
  };
};
