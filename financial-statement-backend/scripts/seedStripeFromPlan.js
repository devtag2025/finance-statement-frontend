require('dotenv').config();
const mongoose = require('mongoose');
const { syncAllActivePlans } = require('../src/services/stripeSync.service');

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');
  await mongoose.connect(process.env.MONGODB_URI);
  await syncAllActivePlans();
  console.log('✅ Synced Stripe products/prices for active plans.');
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
