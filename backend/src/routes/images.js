import { Router } from 'express';
import mongoose from 'mongoose';
import Image from '../models/Image.js';

const router = Router();

// Public: serves an uploaded image by id. Images are never edited in place
// (a new upload gets a new id), so they can be cached for a year.
router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Not found' });
  }
  const image = await Image.findById(req.params.id).lean();
  if (!image) return res.status(404).json({ message: 'Not found' });

  res.set({
    'Content-Type': image.contentType,
    'Cache-Control': 'public, max-age=31536000, immutable',
    // The site and API are on different hosts, so the browser must be allowed
    // to embed this response cross-origin.
    'Cross-Origin-Resource-Policy': 'cross-origin',
  });
  res.send(image.data.buffer ?? image.data);
});

export default router;
