import Category from '../../models/Category.js';
import Product from '../../models/Product.js';

export async function listCategories(req, res) {
  const all = await Category.find().sort({ order: 1, name: 1 });

  // Build tree: top-level items hold their children
  const map = {};
  all.forEach((c) => { map[c._id] = { ...c.toJSON(), children: [] }; });

  const tree = [];
  all.forEach((c) => {
    if (c.parent) {
      map[c.parent]?.children.push(map[c._id]);
    } else {
      tree.push(map[c._id]);
    }
  });

  res.json(tree);
}

export async function createCategory(req, res) {
  const category = await Category.create(req.body);
  res.status(201).json(category);
}

export async function updateCategory(req, res) {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) return res.status(404).json({ message: 'Category not found' });
  res.json(category);
}

export async function deleteCategory(req, res) {
  const hasProducts = await Product.exists({ category: req.params.id });
  if (hasProducts) {
    return res.status(409).json({
      message: 'Cannot delete: this category has products assigned to it. Move or reassign them first.',
    });
  }

  const hasChildren = await Category.exists({ parent: req.params.id });
  if (hasChildren) {
    return res.status(409).json({
      message: 'Cannot delete: this category has sub-categories. Remove them first.',
    });
  }

  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ message: 'Category not found' });
  res.json({ message: 'Category deleted' });
}
