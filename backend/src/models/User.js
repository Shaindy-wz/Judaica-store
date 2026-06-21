import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    phone: String,
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    marketingConsent: { type: Boolean, default: false },
    addresses: [{ label: String, address: String, city: String, zipCode: String }],
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
