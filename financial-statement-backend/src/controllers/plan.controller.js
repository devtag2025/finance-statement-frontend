const Plan = require('../models/plan.model');
const { ensurePrice } = require('../services/stripeSync.service'); // Import from your stripe service

exports.listActivePlans = async (req, res) => {
  const plans = await Plan.find({ active: true }).sort({ amount: 1 });
  res.json({ ok: true, data: plans });
};

exports.adminUpsertPlan = async (req, res) => {
  try {
    const { id, name, key, interval, amount, currency = 'usd', active = true } = req.body;
    let plan;
    
    if (id) {
      plan = await Plan.findByIdAndUpdate(
        id, 
        { name, key, interval, amount, currency, active }, 
        { new: true }
      );
    } else {
      plan = await Plan.create({ name, key, interval, amount, currency, active });
    }

    // Auto-sync with Stripe if plan is active
    if (plan.active) {
      try {
        const priceId = await ensurePrice(plan);
        // Refresh plan to get updated Stripe IDs
        plan = await Plan.findById(plan._id);
      } catch (stripeError) {
        // Plan was created/updated in DB, but Stripe sync failed
        return res.status(500).json({ 
          ok: false, 
          error: `Plan saved but Stripe sync failed: ${stripeError.message}`,
          data: plan 
        });
      }
    }

    res.json({ ok: true, data: plan });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
};

exports.syncStripe = async (req, res) => {
  try {
    const plans = await Plan.find({ active: true });
    const results = [];
    
    for (const plan of plans) {
      try {
        const priceId = await ensurePrice(plan);
        results.push({
          planId: plan._id,
          key: plan.key,
          success: true,
          stripePriceId: priceId
        });
      } catch (error) {
        results.push({
          planId: plan._id,
          key: plan.key,
          success: false,
          error: error.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    res.json({ 
      ok: true, 
      message: `Synced ${successCount} plan(s), ${failCount} failed`,
      results 
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
};