import express from 'express';
import Product from '../models/Product.js';
import { normalizeHebrew } from '../utils/hebrewSearchNormalize.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const raw = req.query.q || '';
    const normalized = normalizeHebrew(raw);
    if (normalized.length < 2) return res.json([]);

    const regex = new RegExp(normalized, 'i');
    const products = await Product.find({
      $or: [{ name: regex }, { searchTokens: regex }],
    })
      .limit(20)
      .select('name slug images basePrice originalPrice variants badge ratingAverage ratingCount')
      .lean();

    const result = products.map((p) => ({
      ...p,
      hasVariants: (p.variants?.length ?? 0) > 1,
      priceRange:
        p.variants?.length > 0
          ? {
              min: Math.min(...p.variants.map((v) => v.price)),
              max: Math.max(...p.variants.map((v) => v.price)),
            }
          : { min: p.basePrice, max: p.basePrice },
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
