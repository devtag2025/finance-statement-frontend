const Stripe = require('stripe');
const Plan = require('../models/plan.model');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

async function ensureProduct(plan) {
  if (plan.stripeProductId) return plan.stripeProductId;
  const product = await stripe.products.create({
    name: plan.name,
    active: true,
    metadata: { planId: String(plan._id), key: plan.key, interval: plan.interval }
  });
  plan.stripeProductId = product.id;
  await plan.save();
  return product.id;
}

async function ensurePrice(plan) {
  // 1) Normalize & validate inputs
  const currency = String(plan.currency || 'usd').toLowerCase();
  const amount = Number(plan.amount);
  const interval = plan.interval;

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error(`Plan amount must be a positive integer (cents). planId=${plan._id}`);
  }
  if (!['month', 'year'].includes(interval)) {
    throw new Error(`Invalid plan.interval "${interval}". planId=${plan._id}`);
  }

  // persist normalized currency if needed
  if (plan.currency !== currency) {
    plan.currency = currency;
    await plan.save();
  }

  const lookupKey =
    plan.stripeLookupKey ||
    `${process.env.APP_LOOKUP_PREFIX || 'app'}_${plan.key}_${interval}`;

  // 2) If we already have a price, check if it matches plan settings
  if (plan.stripePriceId) {
    try {
      const existing = await stripe.prices.retrieve(plan.stripePriceId);
      const existingCurrency = (existing.currency || '').toLowerCase();
      const matches =
        existing.active === true &&
        existing.unit_amount === amount &&
        existingCurrency === currency &&
        existing.recurring?.interval === interval;

      if (matches) {
        // ensure lookup_key is present
        if (!existing.lookup_key) {
          await stripe.prices.update(existing.id, { lookup_key: lookupKey });
        }
        if (!plan.stripeLookupKey) {
          plan.stripeLookupKey = lookupKey;
          await plan.save();
        }
        return existing.id;
      }
      // If it doesn't match, we'll create a new price below and (optionally) deactivate this one.
    } catch (e) {
      // If retrieval fails (deleted/invalid), fall through to create a new price.
    }
  }

  // 3) Try to find by lookup_key (allows reusing prices across environments/updates)
  const byLookup = await stripe.prices.list({ lookup_keys: [lookupKey] });
  if (byLookup.data[0]) {
    const price = byLookup.data[0];

    // If the found price doesn't match the latest plan config, create a new one and deactivate the old.
    const priceCurrency = (price.currency || '').toLowerCase();
    const priceMatches =
      price.active === true &&
      price.unit_amount === amount &&
      priceCurrency === currency &&
      price.recurring?.interval === interval;

    if (!priceMatches) {
      const newPrice = await stripe.prices.create({
        product: plan.stripeProductId || (await ensureProduct(plan)),
        unit_amount: amount,
        currency,
        recurring: { interval },
        lookup_key: lookupKey,
        active: true,
      });
      // Optionally deactivate the old price so new checkouts don’t pick it up
      if (price.active) {
        await stripe.prices.update(price.id, { active: false });
      }
      plan.stripePriceId = newPrice.id;
      plan.stripeLookupKey = lookupKey;
      if (!plan.stripeProductId) plan.stripeProductId = newPrice.product;
      await plan.save();
      return newPrice.id;
    }

    // Matched existing by lookup_key
    plan.stripePriceId = price.id;
    plan.stripeLookupKey = lookupKey;
    if (!plan.stripeProductId) plan.stripeProductId = price.product;
    await plan.save();
    return price.id;
  }

  // 4) Create a fresh Price (this is where your error was: ensure currency is set)
  const productId = plan.stripeProductId || (await ensureProduct(plan));
  const created = await stripe.prices.create({
    product: productId,
    unit_amount: amount,
    currency,                   // <-- guaranteed present & normalized
    recurring: { interval },
    lookup_key: lookupKey,
    active: true,
  });

  plan.stripePriceId = created.id;
  plan.stripeLookupKey = lookupKey;
  if (!plan.stripeProductId) plan.stripeProductId = productId;
  await plan.save();

  return created.id;
}


async function syncAllActivePlans() {
  const plans = await Plan.find({ active: true });
  for (const plan of plans) {
    await ensurePrice(plan);
  }
  return true;
}

module.exports = { ensureProduct, ensurePrice, syncAllActivePlans };
