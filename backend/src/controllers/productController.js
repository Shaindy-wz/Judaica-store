import Product from '../models/Product.js';
import Category from '../models/Category.js';

const SORTS = {
  price_asc: { basePrice: 1 },
  price_desc: { basePrice: -1 },
  newest: { createdAt: -1 },
};

export async function list(req, res) {
  const { category, page = 1, limit = 12, minPrice, maxPrice, sort, tag } = req.query;
  const filter = {};

  if (category) {
    const categoryDoc = await Category.findOne({ slug: category });
    if (!categoryDoc) return res.json({ items: [], total: 0, page: Number(page), pages: 0 });
    filter.category = categoryDoc._id;
  }
  if (tag) filter.tags = tag;
  if (minPrice || maxPrice) {
    filter.basePrice = {};
    if (minPrice) filter.basePrice.$gte = Number(minPrice);
    if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(SORTS[sort] || { createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
}

export async function getBySlug(req, res) {
  const product = await Product.findOne({ slug: req.params.slug }).populate('category');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
}

export async function featured(req, res) {
  const items = await Product.find({ featured: true }).limit(8);
  res.json(items);
}

export async function newArrivals(req, res) {
  const items = await Product.find().sort({ createdAt: -1 }).limit(8);
  res.json(items);
}
