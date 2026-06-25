import Category from '../models/Category.js';

export async function list(req, res) {
  const all = await Category.find().sort({ order: 1, name: 1 });

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

export async function getBySlug(req, res) {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) return res.status(404).json({ message: 'Category not found' });
  const subCategories = await Category.find({ parent: category._id });
  res.json({ ...category.toObject(), subCategories });
}
