import 'dotenv/config';
import { connectDB } from '../config/db.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';

const categories = [
  { name: 'ציצית', slug: 'tzitzit', order: 1 },
  { name: 'טליתות', slug: 'prayer-shawls', order: 2 },
  { name: 'תפילין', slug: 'tefillin', order: 3 },
  { name: 'מזוזות', slug: 'mezuzot', order: 4 },
  { name: 'מתנות', slug: 'general', order: 5 },
  { name: 'שבת', slug: 'shabbat', order: 6 },
  { name: 'כיפות', slug: 'kippot', order: 7 },
  { name: 'פתילים', slug: 'wicks', order: 8 },
  { name: 'נרתיקים', slug: 'talit-tefillin-covers', order: 9 },
  { name: 'סידורים', slug: 'siddurim', order: 10 },
];

async function seed() {
  await connectDB();

  for (const category of categories) {
    await Category.findOneAndUpdate(
      { slug: category.slug },
      { $set: category },
      { upsert: true, returnDocument: 'after' }
    );
    console.log(`Upserted category: ${category.slug}`);
  }

  console.log('Category seeding complete.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Failed to seed categories:', err);
  process.exit(1);
});
