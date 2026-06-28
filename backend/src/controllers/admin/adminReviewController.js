import Review from '../../models/Review.js';
import Product from '../../models/Product.js';

async function recalcProductRating(productId) {
  const result = await Review.aggregate([
    { $match: { product: productId, status: 'approved' } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const avg = result[0]?.avg ?? 0;
  const count = result[0]?.count ?? 0;
  await Product.findByIdAndUpdate(productId, {
    ratingAverage: Math.round(avg * 10) / 10,
    ratingCount: count,
  });
}

export async function listReviews(req, res) {
  const { status = 'pending', page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  const [items, total] = await Promise.all([
    Review.find({ status })
      .populate('product', 'name slug')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Review.countDocuments({ status }),
  ]);

  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
}

export async function approveReview(req, res) {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { status: 'approved' },
    { new: true }
  );
  if (!review) return res.status(404).json({ message: 'Review not found' });
  await recalcProductRating(review.product);
  res.json(review);
}

export async function rejectReview(req, res) {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected' },
    { new: true }
  );
  if (!review) return res.status(404).json({ message: 'Review not found' });
  await recalcProductRating(review.product);
  res.json(review);
}
