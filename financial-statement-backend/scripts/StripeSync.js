// scripts/syncStripePrices.js
const mongoose = require('mongoose');
const Plan = require('../models/plan.model');
const { syncAllActivePlans } = require('../services/stripeSync.service');
require('dotenv').config();

async function syncPrices() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    const plans = await Plan.find({ active: true });
    console.log(`\n📋 Found ${plans.length} active plans\n`);
    console.log('─'.repeat(80));

    for (const plan of plans) {
      try {
        console.log(`\n🔄 Processing: ${plan.name} (${plan.key}/${plan.interval})`);
        
        const { ensurePrice } = require('../services/stripeSync.service');
        const priceId = await ensurePrice(plan);
        
        console.log(`   ✅ Price ID: ${priceId}`);
        console.log(`   📝 Lookup Key: ${plan.stripeLookupKey || 'N/A'}`);
        console.log(`   🏷️  Product ID: ${plan.stripeProductId || 'N/A'}`);
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
      }
    }

    console.log('\n' + '─'.repeat(80));
    console.log('\n✅ Sync completed!');
    console.log('\n🎯 You can now test checkout with these plan IDs:\n');
    
    const updatedPlans = await Plan.find({ active: true });
    updatedPlans.forEach(plan => {
      console.log(`   ${plan.key.toUpperCase()} ${plan.interval}: ${plan._id}`);
    });
    
    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

syncPrices();