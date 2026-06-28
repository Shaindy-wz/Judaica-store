import Order from '../models/Order.js';
import { handleOrderPaid, handleOrderShipped } from '../services/orderFulfillment.js';

const VALID_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

export async function list(req, res) {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const orders = await Order.find(filter).sort({ createdAt: -1 }).populate('user', 'firstName lastName email');
  res.json(orders);
}

export async function updateStatus(req, res) {
  const { status, trackingNumber } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'סטטוס הזמנה לא תקין' });
  }
  if (status === 'shipped' && !trackingNumber) {
    return res.status(400).json({ message: 'יש להזין מספר מעקב לפני סימון ההזמנה כנשלחה' });
  }

  const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');
  if (!order) return res.status(404).json({ message: 'ההזמנה לא נמצאה' });

  const previousStatus = order.status;
  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  await order.save();

  if (status === 'paid' && previousStatus !== 'paid') {
    await handleOrderPaid(order);
  } else if (status === 'shipped' && previousStatus !== 'shipped') {
    await handleOrderShipped(order);
  }

  res.json(order);
}
