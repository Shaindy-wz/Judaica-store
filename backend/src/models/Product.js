import mongoose from 'mongoose';
import { normalizeHebrew } from '../utils/hebrewSearchNormalize.js';

const { Schema } = mongoose;

const VariantSchema = new Schema({
  optionValues: { type: Map, of: String },
  price: { type: Number, required: true },
  sku: String,
  inStock: { type: Boolean, default: true },
  stockQuantity: Number,
});

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    sku: String,
    images: [String],
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    subCategory: String,
    tags: [String],

    options: [{ name: String, values: [String] }],
    variants: [VariantSchema],
    basePrice: { type: Number, required: true },
    originalPrice: Number,

    badge: String,

    specs: {
      material: String,
      kashrut: String,
      hashgacha: String,
      tradition: String,
      craftsmanship: String,
    },

    returnPolicy: {
      returnable: { type: Boolean, default: true },
      customizable: { type: Boolean, default: false },
      nonReturnableReason: String,
    },

    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    searchTokens: [String],

    inStock: { type: Boolean, default: true },
    stockQuantity: Number,
    featured: { type: Boolean, default: false },

    seo: {
      metaTitle: String,
      metaDescription: String,
    },
  },
  { timestamps: true }
);

ProductSchema.pre('save', function (next) {
  this.searchTokens = [normalizeHebrew(this.name)];
  next();
});

ProductSchema.virtual('hasVariants').get(function () {
  return (this.variants?.length ?? 0) > 1;
});

ProductSchema.virtual('priceRange').get(function () {
  if (!this.variants?.length) return { min: this.basePrice, max: this.basePrice };
  const prices = this.variants.map((v) => v.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
});

ProductSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Product', ProductSchema);
