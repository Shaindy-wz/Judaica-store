import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const VERIFIED_STATUSES = ['paid', 'shipped', 'delivered'];

async function recalcProductRating(productId) {
  const [stats] = await Review.aggregate([
    { $match: { product: productId, status: 'approved' } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    ratingAverage: stats?.average ?? 0,
    ratingCount: stats?.count ?? 0,
  });
}

export async function getProductReviews(req, res) {
  const reviews = await Review.find({ product: req.params.id, status: 'approved' })
    .populate('user', 'firstName lastName')
    .sort({ createdAt: -1 });

  res.json(reviews);
}

export async function submitReview(req, res) {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'יש לבחור דירוג בין 1 ל-5 כוכבים' });
  }

  const purchaseOrder = await Order.findOne({
    user: req.userId,
    status: { $in: VERIFIED_STATUSES },
    'items.product': productId,
  });

  if (!purchaseOrder) {
    return res.status(403).json({ message: 'ניתן לדרג רק מוצרים שנרכשו בפועל' });
  }

  const existing = await Review.findOne({ product: productId, user: req.userId });
  if (existing) {
    return res.status(409).json({ message: 'כבר שלחת ביקורת על מוצר זה' });
  }

  const review = await Review.create({
    product: productId,
    user: req.userId,
    order: purchaseOrder._id,
    rating,
    comment,
    verifiedPurchase: true,
  });

  res.status(201).json(review);
}

export async function getSummary(req, res) {
  const [stats] = await Review.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  res.json({ average: stats?.average ?? 0, count: stats?.count ?? 0 });
}

export async function listPending(req, res) {
  const reviews = await Review.find({ status: 'pending' })
    .populate('product', 'name slug')
    .populate('user', 'firstName lastName')
    .sort({ createdAt: 1 });

  res.json(reviews);
}

export async function approve(req, res) {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'הביקורת לא נמצאה' });

  review.status = 'approved';
  await review.save();
  await recalcProductRating(review.product);

  res.json(review);
}

export async function reject(req, res) {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'הביקורת לא נמצאה' });

  const wasApproved = review.status === 'approved';
  review.status = 'rejected';
  await review.save();
  if (wasApproved) await recalcProductRating(review.product);

  res.json(review);
}
