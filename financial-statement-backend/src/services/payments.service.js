const Stripe = require('stripe');
const Plan = require('../models/plan.model');
const Users = require('../models/user.model');
const { ensurePrice } = require('./stripeSync.service');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

async function ensureStripeCustomer(user) {
  if (user.stripeCustomerId) return user.stripeCustomerId;
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name || undefined,
    metadata: { userId: String(user._id) },
  });
  user.stripeCustomerId = customer.id;
  await user.save();
  return customer.id;
}

async function createCheckoutSession({ user, planId, successUrl, cancelUrl }) {
  const plan = await Plan.findById(planId);
  if (!plan || !plan.active) throw new Error('Invalid plan');

  const priceId = await ensurePrice(plan);
  const customerId = await ensureStripeCustomer(user);

  return stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    client_reference_id: String(user._id),
    success_url: `${successUrl}`,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    metadata: { userId: String(user._id), planId: String(plan._id), key: plan.key, interval: plan.interval },
    subscription_data: {
      metadata: { userId: String(user._id), planId: String(plan._id), key: plan.key, interval: plan.interval },
    },
    line_items: [{ price: priceId, quantity: 1 }],
  });
}

async function createBillingPortal({ user, returnUrl }) {
  const customerId = await ensureStripeCustomer(user);
  return stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
}

module.exports = { stripe, createCheckoutSession, createBillingPortal };
