import Product from '../../models/Product.js';
import Category from '../../models/Category.js';

function normalizeHebrew(text) {
  return text
    .normalize('NFKD')
    .replace(/[֑-ׇ]/g, '')
    .replace(/['"]/g, '')
    .trim()
    .toLowerCase();
}

function buildSearchTokens(name) {
  const normalized = normalizeHebrew(name);
  return [name, normalized].filter(Boolean);
}

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
  let slug = base;
  let n = 1;
  while (true) {
    const filter = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    const exists = await Product.exists(filter);
    if (!exists) return slug;
    slug = `${base}-${n++}`;
  }
}

export async function listProducts(req, res) {
  const { page = 1, limit = 20, q, category, inStock } = req.query;
  const filter = {};

  if (q) {
    const regex = new RegExp(normalizeHebrew(q), 'i');
    filter.$or = [{ name: new RegExp(q, 'i') }, { searchTokens: regex }];
  }
  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) filter.category = cat._id;
  }
  if (inStock !== undefined) filter.inStock = inStock === 'true';

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
}

export async function createProduct(req, res) {
  const data = req.body;

  const dupName = await Product.findOne({ name: data.name });
  if (dupName) {
    return res.status(409).json({ message: `מוצר בשם "${data.name}" כבר קיים במערכת.` });
  }

  if (data.sku) {
    const dupSku = await Product.findOne({ sku: data.sku });
    if (dupSku) {
      return res.status(409).json({ message: `מק"ט ${data.sku} כבר שייך למוצר "${dupSku.name}".` });
    }
  }

  data.searchTokens = buildSearchTokens(data.name || '');
  data.slug = await uniqueSlug(toSlug(data.name || 'product'));

  const product = await Product.create(data);
  res.status(201).json(product);
}

export async function updateProduct(req, res) {
  const data = req.body;
  const { id } = req.params;

  if (data.name) {
    const dupName = await Product.findOne({ name: data.name, _id: { $ne: id } });
    if (dupName) {
      return res.status(409).json({ message: `מוצר בשם "${data.name}" כבר קיים במערכת.` });
    }
  }

  if (data.sku) {
    const dupSku = await Product.findOne({ sku: data.sku, _id: { $ne: id } });
    if (dupSku) {
      return res.status(409).json({ message: `מק"ט ${data.sku} כבר שייך למוצר "${dupSku.name}".` });
    }
  }

  if (data.name) {
    data.searchTokens = buildSearchTokens(data.name);
    const existing = await Product.findById(id).select('name');
    if (existing && existing.name !== data.name) {
      data.slug = await uniqueSlug(toSlug(data.name), id);
    } else {
      delete data.slug;
    }
  }

  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
}

export async function deleteProduct(req, res) {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted' });
}

export async function getUploadSignature(req, res) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(503).json({ message: 'Image upload not configured. Set CLOUDINARY_* env vars.' });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'judaica-store/products';

  // Build the string to sign: folder=...&timestamp=...
  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;

  const { createHash } = await import('crypto');
  const signature = createHash('sha256').update(toSign).digest('hex');

  res.json({ signature, timestamp, apiKey, cloudName, folder });
}
