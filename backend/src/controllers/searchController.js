import Product from '../models/Product.js';
import { normalizeHebrew } from '../utils/hebrewSearchNormalize.js';

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function search(req, res) {
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json({ items: [], total: 0 });

  const normalized = normalizeHebrew(q);
  const regex = new RegExp(escapeRegex(normalized), 'i');

  const items = await Product.find({
    $or: [{ searchTokens: regex }, { tags: regex }],
  }).limit(24);

  res.json({ items, total: items.length });
}
