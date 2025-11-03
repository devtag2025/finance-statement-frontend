require('dotenv').config();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

async function ensureProduct({ name, handle, description }) {
  const list = await stripe.products.list({ active: true, limit: 100 });
  let product = list.data.find(p => p.metadata?.handle === handle);
  if (!product) {
    product = await stripe.products.create({ name, description, active: true, metadata: { handle } });
    console.log(`Created product ${name}: ${product.id}`);
  } else {
    console.log(`Found product ${name}: ${product.id}`);
  }
  return product.id;
}

async function ensureRecurringPrice({ productId, unitAmount, currency, interval, lookupKey }) {
  const existing = (await stripe.prices.list({ lookup_keys: [lookupKey] })).data[0];
  if (existing) {
    const same = existing.product === productId
      && existing.unit_amount === unitAmount
      && existing.currency === currency
      && existing.recurring?.interval === interval
      && existing.active;
    if (same) {
      console.log(`Found price ${lookupKey}: ${existing.id}`);
      return existing.id;
    }
    const newPrice = await stripe.prices.create({
      product: productId, unit_amount: unitAmount, currency,
      recurring: { interval }, lookup_key: lookupKey, active: true,
    });
    if (existing.active) await stripe.prices.update(existing.id, { active: false });
    console.log(`Updated price ${lookupKey}: ${newPrice.id} (old ${existing.id} deactivated)`);
    return newPrice.id;
  }
  const price = await stripe.prices.create({
    product: productId, unit_amount: unitAmount, currency,
    recurring: { interval }, lookup_key: lookupKey, active: true,
  });
  console.log(`Created price ${lookupKey}: ${price.id}`);
  return price.id;
}

(async () => {
  try {
    const prefix = process.env.APP_LOOKUP_PREFIX || 'app';
    const currency = 'usd';
    const plans = [
      { handle: 'basic', name: 'Basic Plan', description: 'Basic features', prices: [
        { interval: 'monthly', amount: 1000, lookupKey: `${prefix}_basic_monthly` },
        { interval: 'yearly',  amount: 10000, lookupKey: `${prefix}_basic_yearly` },
      ]},
      { handle: 'pro', name: 'Pro Plan', description: 'Pro features', prices: [
        { interval: 'monthly', amount: 2000, lookupKey: `${prefix}_pro_monthly` },
        { interval: 'yearly',  amount: 20000, lookupKey: `${prefix}_pro_yearly` },
      ]},
    ];
    for (const plan of plans) {
      const productId = await ensureProduct({ name: plan.name, handle: plan.handle, description: plan.description });
      for (const p of plan.prices) {
        await ensureRecurringPrice({ productId, unitAmount: p.amount, currency, interval: p.interval, lookupKey: p.lookupKey });
      }
    }
    console.log('✅ Stripe seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
})();
