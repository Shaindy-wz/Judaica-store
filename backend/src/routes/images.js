import { Router } from 'express';
import mongoose from 'mongoose';
import Image from '../models/Image.js';

const router = Router();

// Images never change once uploaded, so recently served ones are kept in memory
// and repeat requests skip the database round-trip. Capped so a large catalogue
// cannot exhaust the instance's RAM; the oldest entry is evicted first.
const CACHE_LIMIT_BYTES = 64 * 1024 * 1024;
const cache = new Map();
let cacheBytes = 0;

function remember(id, entry) {
  if (entry.data.length > CACHE_LIMIT_BYTES / 4) return;
  cache.set(id, entry);
  cacheBytes += entry.data.length;
  while (cacheBytes > CACHE_LIMIT_BYTES) {
    const [oldestId, oldest] = cache.entries().next().value;
    cache.delete(oldestId);
    cacheBytes -= oldest.data.length;
  }
}

// Public: serves an uploaded image by id. Images are never edited in place
// (a new upload gets a new id), so they can be cached for a year.
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ message: 'Not found' });
  }

  let entry = cache.get(id);
  if (!entry) {
    const image = await Image.findById(id).lean();
    if (!image) return res.status(404).json({ message: 'Not found' });
    entry = { data: Buffer.from(image.data.buffer ?? image.data), contentType: image.contentType };
    remember(id, entry);
  }

  res.set({
    'Content-Type': entry.contentType,
    'Cache-Control': 'public, max-age=31536000, immutable',
    // The site and API may be on different hosts, so the browser must be
    // allowed to embed this response cross-origin.
    'Cross-Origin-Resource-Policy': 'cross-origin',
  });
  res.send(entry.data);
});

export default router;
