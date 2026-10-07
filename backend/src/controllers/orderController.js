import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { normalizeItems, checkStock, recomputeTotals, decrementStock } from '../utils/orderPricing.js';
import { isMockPaymentAllowed } from '../services/nedarimService.js';
import { validateCouponForTotal, calculateDiscount, reserveCouponUsage, releaseCouponUsage } from '../utils/couponValidation.js';

async function resolveLineItem({ productId, variantId, quantity }) {
  const product = await Product.findById(productId);
  if (!product) throw new Error('מוצר לא נמצא');

  let price = product.basePrice;
  if (variantId) {
    const variant = product.variants.find((v) => String(v._id) === String(variantId));
    if (!variant) throw new Error('הוריאציה שנבחרה לא נמצאה');
    price = variant.price;
  }

  return {
    product: product._id,
    variantId: variantId || undefined,
    name: product.name,
    price,
    quantity,
    image: product.images?.[0],
  };
}

export async function create(req, res) {
  const { items, shipping, shippingCost = 0, couponCode } = req.body;
  if (!items?.length) return res.status(400).json({ message: 'Order must contain items' });

  let lineItems;
  try {
    lineItems = await Promise.all(items.map(resolveLineItem));
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let coupon = null;
  let discount = 0;
  if (couponCode) {
    const result = await validateCouponForTotal(couponCode, subtotal);
    if (result.error) return res.status(result.status).json({ message: result.error });

    coupon = await reserveCouponUsage(result.coupon._id);
    if (!coupon) return res.status(400).json({ message: 'הקופון הגיע למגבלת השימוש' });

    discount = calculateDiscount(subtotal, coupon);
  }

  try {
    const order = await Order.create({
      user: req.userId,
      items: lineItems,
      shipping,
      subtotal,
      discount,
      coupon: coupon?._id,
      shippingCost,
      total: subtotal - discount + shippingCost,
      status: 'pending',
    });

    res.status(201).json(order);
  } catch (err) {
    if (coupon) await releaseCouponUsage(coupon._id);
    throw err;
  }
}

export async function myOrders(req, res) {
  const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(orders);
}

export async function mockPay(req, res) {
  // Marks an order 'paid' with no real charge — only for local development
  // before a payment provider is configured. Never reachable in production.
  if (!isMockPaymentAllowed()) return res.status(404).json({ message: 'Not found' });

  const { shippingAddress, couponCode } = req.body;
  const { items, error } = normalizeItems(req.body.items);
  if (error) return res.status(400).json({ message: error });
  if (!shippingAddress?.name || !shippingAddress?.phone || !shippingAddress?.address || !shippingAddress?.city) {
    return res.status(400).json({ message: 'פרטי משלוח חסרים' });
  }

  // 1. Validate stock
  const stockErrors = await checkStock(items);
  if (stockErrors.length) {
    return res.status(409).json({ message: 'מוצרים חסרים במלאי', outOfStock: stockErrors });
  }

  // 2. Recompute totals from DB (never trust frontend numbers)
  const { subtotal, discount, total, couponId } = await recomputeTotals(items, couponCode);

  // 3. Create order
  const order = await Order.create({
    user: req.userId ?? null,
    items,
    subtotal,
    discount,
    total,
    coupon: couponId,
    status: 'paid',
    shipping: {
      name: shippingAddress.name,
      phone: shippingAddress.phone,
      address: shippingAddress.address,
      city: shippingAddress.city,
      zipCode: shippingAddress.zipCode ?? '',
      email: shippingAddress.email ?? '',
    },
    payment: { method: 'mock', transactionId: `MOCK-${Date.now()}` },
  });

  res.status(201).json(order);

  // 4. Background tasks — never block the response
  decrementStock(items).catch((err) => console.error('Stock decrement error:', err));
  if (couponId) {
    Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } }).catch(() => {});
  }
}

export async function getById(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user && String(order.user) !== req.userId && req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.json(order);
}

export async function getInvoice(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'ההזמנה לא נמצאה' });
  if (String(order.user) !== req.userId && req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  if (!order.invoiceUrl) return res.status(404).json({ message: 'החשבונית עדיין לא הופקה' });
  res.json({ invoiceNumber: order.invoiceNumber, invoiceUrl: order.invoiceUrl });
}
