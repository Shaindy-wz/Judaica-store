# 08 — Database Models (MongoDB / Mongoose)

> **Language note:** Product names, descriptions, and other content fields will be stored in **Hebrew**. Model field names are in English.

> **Critical spec note (updated from original):** The `Product` model previously had `specs.sizes: [String]` as a freeform text array. This is replaced with structured `variants` and `options` arrays (see below). Five new models are added: `Review`, `Coupon`, `GiftCard`, `Branch`, `BlogPost`. The `Order` and `User` models are extended.

---

## Product

```js
// models/Product.js
const VariantSchema = new Schema({
  optionValues: { type: Map, of: String },  // e.g. { color: 'לבן', size: '24"' }
  price:        { type: Number, required: true },
  sku:          String,
  inStock:      { type: Boolean, default: true },
  stockQuantity: Number,
});

const ProductSchema = new Schema({
  name:          { type: String, required: true },
  slug:          { type: String, required: true, unique: true },
  description:   String,
  sku:           String,                   // Base SKU (for products without variants)

  images:        [String],                 // Array of image URLs (S3 / Cloudinary)
  category:      { type: ObjectId, ref: 'Category' },
  subCategory:   String,
  tags:          [String],                 // NEW — for filtering, sale badges, SEO

  // Variant system — REPLACES specs.sizes: [String]
  options: [{                              // Ordered list of option dimensions (drives UI selectors)
    name:   String,                        // e.g. 'צבע', 'גימור', 'מידה'
    values: [String],                      // e.g. ['לבן', 'שחור-לבן']
  }],
  variants:      [VariantSchema],          // Each combination of option values with its own price/sku/stock
  basePrice:     { type: Number, required: true }, // Lowest price (displayed when no variant selected)
  originalPrice: Number,                   // Pre-sale price (for strikethrough display)

  badge:         String,                   // 'חדש' | 'מבצע' | 'פופולרי'

  specs: {
    material:       String,                // Fabric / material
    kashrut:        String,                // Kashrut level
    hashgacha:      String,                // NEW — certifying authority name
    tradition:      String,                // NEW — Ashkenazi / Sephardic / Temani / Chabad etc.
    craftsmanship:  String,                // NEW — 'עבודת יד' / 'עבודת מכונה' / etc.
  },

  returnPolicy: {                          // NEW — drives CancellationRightsNotice per product
    returnable:          { type: Boolean, default: true },
    customizable:        { type: Boolean, default: false }, // Personalised items (engraving, stitching) → NOT returnable
    nonReturnableReason: String,           // e.g. 'חפץ קדושה — אינו ניתן להחזרה'
  },

  // Denormalised rating fields — updated automatically when Review is approved
  ratingAverage: { type: Number, default: 0 }, // NEW
  ratingCount:   { type: Number, default: 0 }, // NEW

  // Search
  searchTokens:  [String],                // NEW — normalised Hebrew tokens (with + without niqqud)

  inStock:      { type: Boolean, default: true },
  featured:     { type: Boolean, default: false },

  seo: {                                  // NEW
    metaTitle:       String,
    metaDescription: String,
  },
}, { timestamps: true });
```

### Derived / Computed Properties (not stored)
- `hasVariants` → `variants.length > 1`
- `priceRange` → `{ min, max }` computed from `variants` array min/max prices
- `displayPrice` → `basePrice` if no variants; `min` of variant prices if variants exist

---

## Category

```js
// models/Category.js
const CategorySchema = new Schema({
  name:    { type: String, required: true },
  slug:    { type: String, required: true, unique: true },
  image:   String,
  parent:  { type: ObjectId, ref: 'Category', default: null }, // null = top-level category
  order:   Number,                                              // Display order within parent
});
```

### Tree Structure
Categories support up to 3 levels of depth (example: Mezuzot → Wooden Mezuzah Cases → Up to 10cm). Breadcrumb components reconstruct the ancestor chain by following `parent` references.

---

## Review (NEW)

```js
// models/Review.js
const ReviewSchema = new Schema({
  product:          { type: ObjectId, ref: 'Product', required: true },
  user:             { type: ObjectId, ref: 'User', required: true },
  order:            { type: ObjectId, ref: 'Order' },         // Proof of purchase
  rating:           { type: Number, min: 1, max: 5, required: true },
  comment:          String,
  status:           { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verifiedPurchase: { type: Boolean, default: true },
}, { timestamps: true });
```

**Post-approval hook:** When a review is approved, update `Product.ratingAverage` and `Product.ratingCount` (denormalised fields) by recalculating from all approved reviews for that product.

---

## Coupon (NEW)

```js
// models/Coupon.js
const CouponSchema = new Schema({
  code:           { type: String, required: true, unique: true, uppercase: true },
  type:           { type: String, enum: ['percentage', 'fixed'], required: true },
  value:          { type: Number, required: true }, // e.g. 20 = 20% off or ₪20 off
  minOrderAmount: Number,                            // Minimum cart total to apply coupon
  expiresAt:      Date,
  usageLimit:     Number,                            // Max total uses across all customers
  usedCount:      { type: Number, default: 0 },
  active:         { type: Boolean, default: true },
});
```

---

## GiftCard (NEW)

```js
// models/GiftCard.js
const GiftCardSchema = new Schema({
  code:            { type: String, required: true, unique: true },
  initialAmount:   { type: Number, required: true },
  remainingAmount: { type: Number, required: true },
  purchasedBy:     { type: ObjectId, ref: 'User' },
  recipientEmail:  String,
  message:         String,
  expiresAt:       Date,
  active:          { type: Boolean, default: true },
}, { timestamps: true });
```

---

## Branch (NEW)

```js
// models/Branch.js
const BranchSchema = new Schema({
  city:              { type: String, required: true },
  name:              String,                // e.g. 'ירושלים — רחוב 9'
  address:           String,
  phone:             String,
  hours:             String,                // Free-text or structured per-day object
  lat:               Number,                // For map pin
  lng:               Number,                // For map pin
  accessible:        { type: Boolean, default: true },         // NEW — "Accessible branch" badge
  isFactoryShowroom: { type: Boolean, default: false },        // NEW — branch is also a factory / showroom
});
```

---

## BlogPost (NEW)

```js
// models/BlogPost.js
const BlogPostSchema = new Schema({
  title:       { type: String, required: true },
  slug:        { type: String, required: true, unique: true },
  excerpt:     String,                    // Short summary for list view
  content:     String,                    // Full HTML or Markdown content
  coverImage:  String,
  author:      String,
  publishedAt: Date,
  seo: {
    metaTitle:       String,
    metaDescription: String,
  },
}, { timestamps: true });
```

---

## User (extended)

```js
// models/User.js
const UserSchema = new Schema({
  firstName:        { type: String, required: true },
  lastName:         { type: String, required: true },
  email:            { type: String, required: true, unique: true },
  passwordHash:     { type: String, required: true },
  phone:            String,
  role:             { type: String, enum: ['customer', 'admin'], default: 'customer' }, // NEW
  marketingConsent: { type: Boolean, default: false }, // NEW — must be opt-in (see §10)
  addresses: [{
    label:   String,  // e.g. 'Home', 'Work'
    address: String,
    city:    String,
    zipCode: String,
  }],
}, { timestamps: true });
```

---

## Order (extended)

```js
// models/Order.js
const OrderSchema = new Schema({
  user:     { type: ObjectId, ref: 'User' }, // null for guest checkout

  items: [{
    product:   { type: ObjectId, ref: 'Product' },
    variantId: String,                        // NEW — null for simple products
    name:      String,                        // Snapshot of product name at purchase time
    price:     Number,                        // Snapshot of price at purchase time
    quantity:  Number,
    image:     String,                        // Snapshot of image URL
  }],

  subtotal:     Number,                       // NEW — before discount and shipping
  discount:     Number,                       // NEW — coupon discount amount
  coupon:       { type: ObjectId, ref: 'Coupon' }, // NEW
  shippingCost: Number,                       // NEW

  total:    { type: Number, required: true },

  status:   {
    type:    String,
    enum:    ['pending', 'paid', 'shipped', 'delivered', 'cancelled'], // 'cancelled' added
    default: 'pending',
  },

  shipping: {
    name:    String,
    phone:   String,
    address: String,
    city:    String,
    zipCode: String,
  },

  trackingNumber: String,                     // NEW — set by admin when shipped

  payment: {
    method:        String,                    // e.g. 'cardcom', 'payplus'
    transactionId: String,
  },

  invoiceNumber:  String,                     // NEW — assigned by invoicing service
  invoiceUrl:     String,                     // NEW — PDF download URL

}, { timestamps: true });
```

### Order Status Flow
```
pending → paid → shipped → delivered
        → cancelled (from any status before delivered)
```

- `pending` → set when order is created (before payment)
- `paid` → set **only** by the payment webhook (`POST /api/payments/webhook`)
- `shipped` → set by admin in the admin panel (with tracking number)
- `delivered` → set by admin or confirmed delivery notification
- `cancelled` → set by admin; triggers refund flow if status was `paid`
