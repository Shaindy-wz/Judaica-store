import mongoose from 'mongoose';

const { Schema } = mongoose;

const CouponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  minOrderAmount: Number,
  expiresAt: Date,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  couponMode: { type: String, enum: ['shared', 'per_customer', 'personal'], default: 'per_customer' },
  forEmail: { type: String, lowercase: true, trim: true }, // personal mode only
  onePerCustomer: { type: Boolean, default: true }, // legacy — superseded by couponMode
  usedByEmails: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.model('Coupon', CouponSchema);
