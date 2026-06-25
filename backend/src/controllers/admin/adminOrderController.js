import Order from '../../models/Order.js';

export async function listOrders(req, res) {
  const { page = 1, limit = 20, status, q } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (q) {
    // Search by order ID prefix or customer name/email via populate
    filter.$or = [{ 'shipping.name': new RegExp(q, 'i') }];
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  const [items, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
}

export async function getOrder(req, res) {
  const order = await Order.findById(req.params.id)
    .populate('user', 'firstName lastName email phone')
    .populate('items.product', 'name slug images');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
}

export async function updateOrderStatus(req, res) {
  const { status, trackingNumber } = req.body;
  const allowed = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  // Guard: 'paid' can only be set by the webhook, not by admin UI
  if (status === 'paid') {
    return res.status(403).json({ message: "Status 'paid' can only be set by the payment webhook" });
  }

  const update = { status };
  if (trackingNumber !== undefined) update.trackingNumber = trackingNumber;

  const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
}
