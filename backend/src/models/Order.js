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
    },
    trackingNumber: String,
    payment: { method: String, transactionId: String },
    invoiceNumber: String,
    invoiceUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model('Order', OrderSchema);
