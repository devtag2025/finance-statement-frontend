// scripts/seedPlans.js
const mongoose = require('mongoose');
const Plan = require('../src/models/plan.model');
require('dotenv').config();

const plans = [
  {
    name: 'Basic Monthly',
    key: 'basic',
    interval: 'month',
    amount: 999, // $9.99 in cents
    currency: 'usd',
    exportsLimit: 20,
    description: 'Perfect for individuals and small teams',
    features: [
      '20 exports per month',
      'Basic support',
      'Email notifications',
      'Standard templates'
    ],
    active: true,
  },
  {
    name: 'Basic Yearly',
    key: 'basic',
    interval: 'year',
    amount: 9999, // $99.99 in cents
    currency: 'usd',
    exportsLimit: 20,
    description: 'Perfect for individuals and small teams - Save 17%',
    features: [
      '20 exports per month',
      'Basic support',
      'Email notifications',
      'Standard templates',
      '2 months free'
    ],
    active: true,
  },
  {
    name: 'Pro Monthly',
    key: 'pro',
    interval: 'month',
    amount: 2999, // $29.99 in cents
    currency: 'usd',
    exportsLimit: 200,
    description: 'For professionals and growing businesses',
    features: [
      '200 exports per month',
      'Priority support',
      'Advanced analytics',
      'API access',
      'Custom templates',
      'Team collaboration'
    ],
    active: true,
  },
  {
    name: 'Pro Yearly',
    key: 'pro',
    interval: 'year',
    amount: 29999, // $299.99 in cents
    currency: 'usd',
    exportsLimit: 200,
    description: 'For professionals and growing businesses - Save 17%',
    features: [
      '200 exports per month',
      'Priority support',
      'Advanced analytics',
      'API access',
      'Custom templates',
      'Team collaboration',
      '2 months free'
    ],
    active: true,
  },
];

async function seedPlans() {
  try {
    await mongoose.connect("mongodb+srv://developertag2025_db_user:IMbAsi5X1ofE8vii@cluster0.r1xqowr.mongodb.net/?appName=Cluster0");
    console.log('✅ Connected to MongoDB');

    // Clear existing plans
    // await Plan.deleteMany({});
    // console.log('🗑️  Cleared existing plans');

    // Insert new plans
    const createdPlans = await Plan.insertMany(plans);
    console.log('✅ Plans seeded successfully\n');

    console.log('📋 Created plans:');
    console.log('─'.repeat(80));
    createdPlans.forEach(plan => {
      console.log(`
  📦 ${plan.name}
     ID: ${plan._id}
     Key: ${plan.key}
     Interval: ${plan.interval}
     Amount: $${(plan.amount / 100).toFixed(2)}
     Exports: ${plan.exportsLimit}/month
      `);
    });
    console.log('─'.repeat(80));

    console.log('\n🎯 Next steps:');
    console.log('1. Run: node scripts/syncStripePrices.js');
    console.log('2. Or manually create prices in Stripe Dashboard');
    console.log('3. Test checkout with one of the plan IDs above\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
    process.exit(1);
  }
}

seedPlans();