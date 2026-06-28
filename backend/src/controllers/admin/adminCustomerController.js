import User from '../../models/User.js';
import Order from '../../models/Order.js';

export async function listCustomers(req, res) {
  const { page = 1, limit = 20, q } = req.query;
  const filter = { role: 'customer' };

  if (q) {
    filter.$or = [
      { email: new RegExp(q, 'i') },
      { firstName: new RegExp(q, 'i') },
      { lastName: new RegExp(q, 'i') },
    ];
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  const [users, total] = await Promise.all([
    User.find(filter, '-passwordHash')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  // Attach order count + total spend per customer
  const ids = users.map((u) => u._id);
  const orderStats = await Order.aggregate([
    { $match: { user: { $in: ids }, status: { $in: ['paid', 'shipped', 'delivered'] } } },
    { $group: { _id: '$user', orderCount: { $sum: 1 }, totalSpend: { $sum: '$total' } } },
  ]);
  const statsMap = {};
  orderStats.forEach((s) => { statsMap[s._id] = s; });

  const items = users.map((u) => ({
    ...u.toJSON(),
    orderCount: statsMap[u._id]?.orderCount ?? 0,
    totalSpend: statsMap[u._id]?.totalSpend ?? 0,
  }));

  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
}

export async function getCustomerOrders(req, res) {
  const orders = await Order.find({ user: req.params.id })
    .sort({ createdAt: -1 });
  res.json(orders);
}
