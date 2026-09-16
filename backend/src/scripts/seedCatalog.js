/**
 * Seeds the showcase catalogue — categories, sub-categories, products, demo
 * reviews and demo coupons.
 *
 *   npm run seed:images   # generate the artwork first
 *   npm run seed:catalog
 *
 * Everything is upserted by slug/code, so the script is safe to re-run and it
 * never deletes data that was entered through the admin panel.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import { categories, products, coupons, reviewTexts, reviewers } from './demoCatalog.js';

const IMAGE_VIEWS = 3;

async function seedCategories() {
  const bySlug = new Map();

  // Parents first, so children can resolve their parent id.
  for (const category of categories.filter((c) => !c.parentSlug)) {
    const doc = await Category.findOneAndUpdate(
      { slug: category.slug },
      {
        $set: {
          name: category.name,
          slug: category.slug,
          order: category.order,
          parent: null,
          image: category.art ? `/images/categories/${category.slug}.svg` : undefined,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
    bySlug.set(category.slug, doc);
  }

  for (const category of categories.filter((c) => c.parentSlug)) {
    const parent = bySlug.get(category.parentSlug);
    if (!parent) {
      console.warn(`  ! parent "${category.parentSlug}" missing for "${category.slug}" — skipped`);
      continue;
    }
    const doc = await Category.findOneAndUpdate(
      { slug: category.slug },
      { $set: { name: category.name, slug: category.slug, order: category.order, parent: parent._id } },
      { upsert: true, returnDocument: 'after' }
    );
    bySlug.set(category.slug, doc);
  }

  console.log(`Categories upserted: ${bySlug.size}`);
  return bySlug;
}

async function seedProducts(categoriesBySlug) {
  const docs = [];

  for (const { categorySlug, art, palette, ...data } of products) {
    const category = categoriesBySlug.get(categorySlug);
    if (!category) {
      console.warn(`  ! category "${categorySlug}" missing — skipped "${data.slug}"`);
      continue;
    }

    const images = Array.from(
      { length: IMAGE_VIEWS },
      (_, i) => `/images/products/${data.slug}-${i + 1}.svg`
    );

    const doc = await Product.findOneAndUpdate(
      { slug: data.slug },
      {
        $set: {
          ...data,
          images,
          category: category._id,
          inStock: true,
          stockQuantity: data.variants?.length ? undefined : 25,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
    docs.push(doc);
  }

  console.log(`Products upserted: ${docs.length}`);
  return docs;
}

/**
 * Demo reviews are attributed to showcase accounts. They are created with a
 * random password hash and are never intended to be logged into — delete them
 * once the store has real customers.
 */
async function ensureReviewers() {
  const docs = [];

  for (const [index, reviewer] of reviewers.entries()) {
    const email = `demo${index + 1}@example.com`;
    const doc = await User.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          firstName: reviewer.firstName,
          lastName: reviewer.lastName,
          email,
          passwordHash: await bcrypt.hash(`demo-${Math.random().toString(36).slice(2)}`, 10),
          role: 'customer',
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
    docs.push(doc);
  }

  return docs;
}

/**
 * Seeds 3–6 approved reviews per product, then recomputes the product's
 * ratingAverage / ratingCount from what was actually written — so the number on
 * the product card always matches the reviews listed on the product page.
 */
async function seedReviews(productDocs) {
  const authors = await ensureReviewers();
  let created = 0;

  for (const [productIndex, product] of productDocs.entries()) {
    const reviewCount = 3 + (productIndex % 4);
    const ratings = [];

    for (let i = 0; i < reviewCount; i += 1) {
      const author = authors[(productIndex * 3 + i) % authors.length];
      const text = reviewTexts[(productIndex * 5 + i) % reviewTexts.length];
      ratings.push(text.rating);

      const result = await Review.updateOne(
        { product: product._id, user: author._id },
        {
          $set: {
            rating: text.rating,
            comment: text.comment,
            status: 'approved',
            verifiedPurchase: true,
          },
        },
        { upsert: true }
      );
      if (result.upsertedCount) created += 1;
    }

    const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    await Product.updateOne(
      { _id: product._id },
      { $set: { ratingAverage: Math.round(average * 10) / 10, ratingCount: ratings.length } }
    );
  }

  console.log(`Demo reviews created: ${created}`);
}

async function seedCoupons() {
  for (const coupon of coupons) {
    await Coupon.findOneAndUpdate({ code: coupon.code }, { $set: coupon }, { upsert: true });
  }
  console.log(`Coupons upserted: ${coupons.length}`);
}

async function seed() {
  await connectDB();

  const categoriesBySlug = await seedCategories();
  const productDocs = await seedProducts(categoriesBySlug);
  await seedReviews(productDocs);
  await seedCoupons();

  console.log('\nCatalogue seeding complete.');
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error('Failed to seed catalogue:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
