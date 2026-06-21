import Order from '../models/Order.js';

export async function create(req, res) {
  const { items, shipping, subtotal, discount, shippingCost, total } = req.body;
  if (!items?.length) return res.status(400).json({ message: 'Order must contain items' });

  const order = await Order.create({
    user: req.userId,
    items,
    shipping,
    subtotal,
    discount,
    shippingCost,
    total,
    status: 'pending',
  });

  res.status(201).json(order);
}

export async function myOrders(req, res) {
  const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(orders);
}

export async function getById(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (String(order.user) !== req.userId && req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.json(order);
}
