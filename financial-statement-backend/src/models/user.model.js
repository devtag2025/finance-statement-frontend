// src/models/user.model.js
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String, required: true, unique: true, trim: true, lowercase: true,
      validate(value) { if (!validator.isEmail(value)) throw new Error('Invalid email'); },
    },
    password: {
      type: String, required: true, trim: true, minlength: 8, private: true,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
    },
    role: { type: String, enum: roles, default: 'user' },
    isEmailVerified: { type: Boolean, default: false },

    // --- Stripe subscription wiring ---
    stripeCustomerId: { type: String, index: true },
    stripeSubscriptionId: { type: String },
    subscriptionStatus: { type: String }, // 'active','trialing','past_due','canceled', etc
    currentPeriodEnd: { type: Date },

    // Plan mapping (either by ref or flat fields for convenience)
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    planKey: { type: String, enum: ['basic','pro'] },
    planInterval: { type: String, enum: ['month','year','weekly','day','monthly','yearly'] }, // we store what you prefer

    // --- Usage (example: exports per period) ---
    exportsUsed: { type: Number, default: 0 },
    exportsLimit: { type: Number, default: 0 },    // set on plan change (e.g. basic=20, pro=200)
    usagePeriod: {                                   
      // tracks current window; reset on new billing cycle or monthly
      periodStart: { type: Date },
      periodEnd: { type: Date },
    },
  },
  { timestamps: true }
);

userSchema.index({ stripeCustomerId: 1 });

// plugins
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

// email taken
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

// password check
userSchema.methods.isPasswordMatch = async function (password) {
  return bcrypt.compare(password, this.password);
};

// hash password
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 8);
  next();
});

// helpers
userSchema.methods.isSubActive = function () {
  return this.subscriptionStatus === 'active' || this.subscriptionStatus === 'trialing';
};

const User = mongoose.model('User', userSchema);
module.exports = User;
