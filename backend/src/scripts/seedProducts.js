import 'dotenv/config';
import { connectDB } from '../config/db.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

const products = [
  {
    name: 'בגד ציצית עם פסים שחורים',
    slug: 'tzitzit-katan-pasim-shchorim',
    description: 'בגד ציצית (טלית קטן) בגזרת פונצ\'ו, עשוי כותנה, עם פסים שחורים-כסופים ועם ציציות לבנות בארבע הכנפות.',
    categorySlug: 'tzitzit',
    images: [
      '/images/products/tzitzit-katan-1.jpg',
      '/images/products/tzitzit-katan-2.jpg',
      '/images/products/tzitzit-katan-3.jpg',
      '/images/products/tzitzit-katan-4.jpg',
      '/images/products/tzitzit-katan-5.jpg',
      '/images/products/tzitzit-katan-6.jpg',
      '/images/products/tzitzit-katan-7.jpg',
      '/images/products/tzitzit-katan-8.jpg',
      '/images/products/tzitzit-katan-9.jpg',
    ],
    tags: ['ציצית', 'טלית קטן'],
    basePrice: 89,
    specs: {
      material: 'כותנה',
      hashgacha: 'בד"ץ העדה החרדית',
    },
    returnPolicy: {
      returnable: true,
      customizable: false,
    },
  },
];

async function seed() {
  await connectDB();

  for (const { categorySlug, ...productData } of products) {
    const category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      console.warn(`Category not found for slug "${categorySlug}", skipping product "${productData.name}"`);
      continue;
    }

    await Product.findOneAndUpdate(
      { slug: productData.slug },
      { $set: { ...productData, category: category._id } },
      { upsert: true, returnDocument: 'after' }
    );
    console.log(`Upserted product: ${productData.slug}`);
  }

  console.log('Product seeding complete.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Failed to seed products:', err);
  process.exit(1);
});
