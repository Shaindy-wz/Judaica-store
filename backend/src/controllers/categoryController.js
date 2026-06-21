import Category from '../models/Category.js';

export async function list(req, res) {
  const categories = await Category.find().sort({ order: 1 });
  res.json(categories);
}

export async function getBySlug(req, res) {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) return res.status(404).json({ message: 'Category not found' });
  const subCategories = await Category.find({ parent: category._id });
  res.json({ ...category.toObject(), subCategories });
}
