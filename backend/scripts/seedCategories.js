import 'dotenv/config';
import mongoose from 'mongoose';
import Category from '../src/models/Category.js';

await mongoose.connect(process.env.MONGODB_URI);

const categories = [
  { name: 'ציצית',   slug: 'tzitzit',       order: 1 },
  { name: 'טליתות',  slug: 'prayer-shawls',  order: 2 },
  { name: 'תפילין',  slug: 'tefillin',       order: 3 },
  { name: 'מזוזות',  slug: 'mezuzot',        order: 4 },
  { name: 'מתנות',   slug: 'general',        order: 5 },
  { name: 'שבת',     slug: 'shabbat',        order: 6 },
];

for (const cat of categories) {
  await Category.findOneAndUpdate(
    { slug: cat.slug },
    cat,
    { upsert: true, new: true }
  );
  console.log('✓', cat.name, '→', cat.slug);
}

console.log('Done.');
await mongoose.disconnect();
