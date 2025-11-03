
const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  key: { type: String, enum: ['basic','pro'], required: true, unique: true },
  interval: { type: String, enum: ['month','year'], required: true },
  amount: { type: Number, required: true }, // cents
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Plan', PlanSchema);
