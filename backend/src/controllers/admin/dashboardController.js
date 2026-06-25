import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import Review from '../../models/Review.js';

export async function getDashboard(req, res) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    revenueToday,
    revenueWeek,
    revenueMonth,
    newOrdersToday,
    recentOrders,
    lowStockProducts,
    pendingReviews,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $in: ['paid', 'shipped', 'delivered'] }, createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.aggregate([
      { $match: { status: { $in: ['paid', 'shipped', 'delivered'] }, createdAt: { $gte: startOfWeek } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.aggregate([
      { $match: { status: { $in: ['paid', 'shipped', 'delivered'] }, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.countDocuments({ createdAt: { $gte: startOfToday } }),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'firstName lastName email'),
    Product.find({ inStock: true, 'variants.stockQuantity': { $lte: 5 } }).limit(10),
    Review.countDocuments({ status: 'pending' }),
  ]);

  res.json({
    revenue: {
      today: revenueToday[0]?.total ?? 0,
      week: revenueWeek[0]?.total ?? 0,
      month: revenueMonth[0]?.total ?? 0,
    },
    newOrdersToday,
    recentOrders,
    lowStockProducts,
    pendingReviews,
  });
}
