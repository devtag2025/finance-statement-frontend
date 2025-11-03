const { stripe, createCheckoutSession, createBillingPortal } = require('../services/payments.service');
const Users = require('../models/user.model');
const Plan = require('../models/plan.model');
const logger = require('../config/logger');

exports.createCheckout = async (req, res) => {
  try {
    const { planId } = req.body || {};
    if (!planId) return res.status(400).json({ ok: false, reason: 'MISSING_PLAN_ID' });

    const session = await createCheckoutSession({
      user: req.user,
      planId,
      successUrl: `${process.env.APP_BASE_URL}/billing/success`,
      cancelUrl: `${process.env.APP_BASE_URL}/billing/cancel`,
    });

    res.json({ ok: true, url: session.url });
  } catch (e) {
    logger.error(e, { route: 'POST /billing/create-checkout-session', body: req.body, userId: req.user?._id });
    res.status(500).json({ ok: false, reason: 'CHECKOUT_FAILED' });
  }
};

exports.createPortal = async (req, res) => {
  try {
    const portal = await createBillingPortal({
      user: req.user,
      returnUrl: `${process.env.APP_BASE_URL}/account`,
    });
    res.json({ ok: true, url: portal.url });
  } catch (e) {
    logger.error(e, { route: 'POST /billing/create-portal', userId: req.user?._id });
    res.status(500).json({ ok: false, reason: 'PORTAL_FAILED' });
  }
};

exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const cs = event.data.object;
        const customerId = cs.customer;
        let user = await Users.findOne({ stripeCustomerId: customerId });
        if (!user && cs.client_reference_id) user = await Users.findById(cs.client_reference_id);
        if (user) {
          if (!user.stripeCustomerId) user.stripeCustomerId = customerId;
          if (cs.subscription) {
            user.stripeSubscriptionId = cs.subscription;
            user.subscriptionStatus = 'active';
          }
          if (cs.metadata?.planId) user.planId = cs.metadata.planId;
          user.planKey = cs.metadata?.key || user.planKey;
          user.planInterval = cs.metadata?.interval || user.planInterval;
          await user.save();
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        let user = await Users.findOne({ stripeCustomerId: customerId });
        const planDoc = await Plan.findOne({
          key: user.planKey,
          interval: user.planInterval === 'monthly' || user.planInterval === 'month' ? 'monthly' : 'yearly',
          active: true,
        });

        if (planDoc) {
          user.planId = planDoc._id;
          // Example limits: set once per (re)subscription period
          user.exportsLimit = user.planKey === 'pro' ? 200 : 20;
          user.exportsUsed =
            user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing' ? user.exportsUsed : 0;

          // set usage window to Stripe current_period (preferred)
          if (sub.current_period_start && sub.current_period_end) {
            user.usagePeriod = {
              periodStart: new Date(sub.current_period_start * 1000),
              periodEnd: new Date(sub.current_period_end * 1000),
            };
          } else if (!user.usagePeriod?.periodEnd || user.usagePeriod.periodEnd < new Date()) {
            // fallback monthly window if stripe data absent
            const start = new Date();
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setMonth(end.getMonth() + 1);
            user.usagePeriod = { periodStart: start, periodEnd: end };
          }
        }
        await user.save();

        break;
      }
      default:
        break;
    }
    res.sendStatus(200);
  } catch (e) {
    logger.error(e, { route: 'POST /billing/webhook' });
    res.status(500).send('Webhook handler error');
  }
};
