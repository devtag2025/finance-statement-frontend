// src/services/usage.service.js
const User = require('../models/user.model');

function now() { return new Date(); }

async function ensureUsageWindow(user) {
  // If Stripe window exists & valid, keep it
  if (user.usagePeriod?.periodEnd && user.usagePeriod.periodEnd > now()) return user;

  // Fallback: monthly window aligned to calendar months
  const start = new Date(); start.setDate(1); start.setHours(0,0,0,0);
  const end = new Date(start); end.setMonth(end.getMonth()+1);
  user.usagePeriod = { periodStart: start, periodEnd: end };
  user.exportsUsed = 0;
  return user.save();
}

async function canConsumeExport(userId, n = 1) {
  const user = await User.findById(userId);
  if (!user) return { ok:false, reason:'NO_USER' };
  await ensureUsageWindow(user);
  const limit = user.exportsLimit || 0;
  const used = user.exportsUsed || 0;
  const ok = user.isSubActive() && (limit === 0 || used + n <= limit); // limit 0 = unlimited
  return { ok, limit, used, periodEnd: user.usagePeriod?.periodEnd };
}

async function recordExport(userId, n = 1) {
  const user = await User.findById(userId);
  if (!user) throw new Error('NO_USER');
  await ensureUsageWindow(user);
  user.exportsUsed = (user.exportsUsed || 0) + n;
  await user.save();
  return { used: user.exportsUsed, limit: user.exportsLimit, periodEnd: user.usagePeriod?.periodEnd };
}

module.exports = { ensureUsageWindow, canConsumeExport, recordExport };
