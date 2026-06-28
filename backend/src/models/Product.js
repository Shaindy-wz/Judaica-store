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

// Computes normalised (niqqud/dagesh-stripped) variants of the product name + tags,
// so search matches regardless of vowel marks.
function computeSearchTokens(name, tags = []) {
  const normalizedName = normalizeHebrew(name);
  const words = normalizedName.split(/\s+/).filter(Boolean);
  const tokens = new Set([normalizedName, ...words]);
  for (const tag of tags || []) {
    tokens.add(normalizeHebrew(tag));
  }
  return Array.from(tokens).filter(Boolean);
}

ProductSchema.pre('save', function () {
  if (this.isModified('name') || this.isModified('tags') || this.isNew) {
    this.searchTokens = computeSearchTokens(this.name, this.tags);
  }
});

// findOneAndUpdate/findByIdAndUpdate bypass 'save' middleware, so recompute searchTokens here too.
ProductSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate();
  const set = update.$set ?? update;
  if (set.name === undefined && set.tags === undefined) return;

  const existing = await this.model.findOne(this.getQuery()).select('name tags').lean();
  const name = set.name ?? existing?.name ?? '';
  const tags = set.tags ?? existing?.tags ?? [];
  const tokens = computeSearchTokens(name, tags);

  if (update.$set) update.$set.searchTokens = tokens;
  else update.searchTokens = tokens;
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
