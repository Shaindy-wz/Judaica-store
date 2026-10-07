import mongoose from 'mongoose';

const { Schema } = mongoose;

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        variantId: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    subtotal: Number,
    discount: Number,
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    shippingCost: Number,
    total: Number,
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shipping: {
      name: String,
      phone: String,
      address: String,
      city: String,
      zipCode: String,
      // Lets guests (no User document) receive the confirmation email.
      email: String,
    },
    trackingNumber: String,
    payment: {
      method: String,                 // 'nedarim' | 'mock'
      transactionId: String,          // provider's transaction id, set by the verified webhook
      providerSessionId: String,      // Nedarim CreateTransaction "ID" handed to the iframe
      confirmation: String,           // card company authorisation number (מספר אישור)
      cardLastDigits: String,
      installments: Number,
      paidAt: Date,
      lastError: String,              // last decline message, for the admin order view
      // Lets a guest poll their own order's payment status. Never returned by default.
      clientToken: { type: String, select: false },
    },
    invoiceNumber: String,
    invoiceUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model('Order', OrderSchema);
