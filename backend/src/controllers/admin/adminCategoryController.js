import Category from '../../models/Category.js';
import Product from '../../models/Product.js';

function toSlug(str) {
  return str
    .normalize('NFKD')
    .replace(/[֑-ׇ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w֐-׿-]/g, '')
    .toLowerCase()
    .slice(0, 80);
}

async function uniqueSlug(base, excludeId = null) {
  let slug = base || 'category';
  let n = 1;
  while (true) {
    const filter = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    const exists = await Category.exists(filter);
    if (!exists) return slug;
    slug = `${base}-${n++}`;
  }
}

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
  const { name, parent, image, order } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'שם הקטגוריה חובה' });

  const slug = await uniqueSlug(toSlug(name));
  const category = await Category.create({ name: name.trim(), slug, parent: parent || undefined, image, order });
  res.status(201).json(category);
}

export async function updateCategory(req, res) {
  const { name, parent, image, order } = req.body;
  const data = { parent: parent || undefined, image, order };
  if (name?.trim()) {
    data.name = name.trim();
    data.slug = await uniqueSlug(toSlug(name), req.params.id);
  }

  const category = await Category.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
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
