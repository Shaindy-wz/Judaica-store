import crypto from 'crypto';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import { normalizeItems, checkStock, recomputeTotals, decrementStock } from '../utils/orderPricing.js';
import { handleOrderPaid } from '../services/orderFulfillment.js';
import {
  IFRAME_URL,
  isConfigured,
  isMockPaymentAllowed,
  getMaxInstallments,
  createTransaction,
  signOrderId,
  isValidSignature,
  parseCallback,
  verifyCallback,
  sourceIp,
} from '../services/nedarimService.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function callbackUrl(req, orderId) {
  // PUBLIC_URL must be set when the API sits behind a host name Nedarim can't
  // reach via the incoming Host header (e.g. local tunnels).
  const base = (process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
  return `${base}/api/payments/webhook?order=${orderId}&sig=${signOrderId(orderId)}`;
}

function validateShipping(shipping) {
  if (!shipping?.name?.trim() || !shipping?.phone?.trim() || !shipping?.address?.trim() || !shipping?.city?.trim()) {
    return 'פרטי משלוח חסרים';
  }
  if (!EMAIL_RE.test(shipping.email?.trim() || '')) return 'כתובת האימייל אינה תקינה';
  return null;
}

async function startTransaction(req, res, order, installments) {
  try {
    const { transactionId, installments: granted } = await createTransaction({
      order,
      installments,
      callbackUrl: callbackUrl(req, order._id),
    });
    order.payment.providerSessionId = transactionId;
    order.payment.installments = granted;
    order.payment.lastError = undefined;
    await order.save();

    res.status(201).json({
      orderId: order._id,
      clientToken: order.payment.clientToken,
      transactionId,
      iframeUrl: IFRAME_URL,
      total: order.total,
    });
  } catch (err) {
    console.error(`[payments] CreateTransaction failed for order ${order._id}:`, err.message);
    res.status(502).json({ message: 'לא הצלחנו להתחבר למערכת הסליקה. אנא נסו שוב בעוד רגע.' });
  }
}

// GET /api/payments/config — tells the checkout which payment flow to render.
export function getConfig(req, res) {
  let provider = null;
  if (isConfigured()) provider = 'nedarim';
  else if (isMockPaymentAllowed()) provider = 'mock';
  res.json({ provider, maxInstallments: getMaxInstallments() });
}

// POST /api/payments/create-session
// New order:   { items, shippingAddress, couponCode, installments }
// Retry after a declined card on the same pending order: { orderId, clientToken, installments }
export async function createSession(req, res) {
  if (!isConfigured()) return res.status(503).json({ message: 'התשלום באשראי אינו זמין כרגע' });

  const { orderId, clientToken, installments } = req.body;

  if (orderId) {
    if (!mongoose.isValidObjectId(orderId)) return res.status(404).json({ message: 'ההזמנה לא נמצאה' });
    const order = await Order.findById(orderId).select('+payment.clientToken');
    if (!order || !clientToken || order.payment?.clientToken !== clientToken) {
      return res.status(404).json({ message: 'ההזמנה לא נמצאה' });
    }
    if (order.status !== 'pending') return res.status(409).json({ message: 'ההזמנה כבר שולמה' });
    return startTransaction(req, res, order, installments);
  }

  const { items, error } = normalizeItems(req.body.items);
  if (error) return res.status(400).json({ message: error });

  const shipping = req.body.shippingAddress;
  const shippingError = validateShipping(shipping);
  if (shippingError) return res.status(400).json({ message: shippingError });

  const stockErrors = await checkStock(items);
  if (stockErrors.length) {
    return res.status(409).json({ message: 'מוצרים חסרים במלאי', outOfStock: stockErrors });
  }

  // Never trust frontend numbers — this total is what Nedarim will charge.
  const { subtotal, discount, total, couponId } = await recomputeTotals(items, req.body.couponCode);
  if (total <= 0) return res.status(400).json({ message: 'סכום ההזמנה אינו תקין' });

  const order = await Order.create({
    user: req.userId ?? null,
    items,
    subtotal,
    discount,
    total,
    coupon: couponId,
    status: 'pending',
    shipping: {
      name: shipping.name.trim(),
      phone: shipping.phone.trim(),
      address: shipping.address.trim(),
      city: shipping.city.trim(),
      zipCode: shipping.zipCode?.trim() ?? '',
      email: shipping.email.trim().toLowerCase(),
    },
    payment: { method: 'nedarim', clientToken: crypto.randomBytes(24).toString('hex') },
  });

  return startTransaction(req, res, order, installments);
}

// GET /api/payments/:orderId/status?token= — polled by the checkout after the
// iframe reports success, until the webhook has confirmed the payment.
export async function getStatus(req, res) {
  const { orderId } = req.params;
  if (!mongoose.isValidObjectId(orderId)) return res.status(404).json({ message: 'ההזמנה לא נמצאה' });

  const order = await Order.findById(orderId).select('status payment.lastError +payment.clientToken');
  if (!order || !req.query.token || order.payment?.clientToken !== req.query.token) {
    return res.status(404).json({ message: 'ההזמנה לא נמצאה' });
  }
  res.json({ status: order.status, paid: order.status !== 'pending' && order.status !== 'cancelled' });
}

// POST /api/payments/webhook?order=&sig= — Nedarim Plus CallBack.
// The only code path in the store that may set Order.status = 'paid'.
export async function webhook(req, res) {
  const { order: orderId, sig } = req.query;
  const callback = parseCallback(req.body);
  const ip = sourceIp(req);

  if (!mongoose.isValidObjectId(orderId) || !isValidSignature(orderId, sig)) {
    console.warn(`[payments] Rejected CallBack with invalid signature from ${ip}`);
    return res.status(403).send('invalid signature');
  }

  // Once we've decided on a CallBack, answer 200 so Nedarim doesn't keep
  // re-sending it. Only an unexpected failure answers 500, so it is retried.
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      console.warn(`[payments] CallBack for unknown order ${orderId}`);
      return res.status(200).send('unknown order');
    }
    if (order.status !== 'pending') return res.status(200).send('already processed');

    const verification = await verifyCallback(req, callback, order);
    if (!verification.verified) {
      console.warn(`[payments] CallBack not accepted for order ${orderId}: ${verification.reason}`);
      if (!callback.approved) {
        await Order.updateOne({ _id: orderId, status: 'pending' }, { 'payment.lastError': callback.message || 'העסקה נדחתה' });
      }
      return res.status(200).send('not accepted');
    }

    // Atomic pending → paid, so a duplicate CallBack can't fulfil the order twice.
    const paid = await Order.findOneAndUpdate(
      { _id: orderId, status: 'pending' },
      {
        $set: {
          status: 'paid',
          'payment.method': 'nedarim',
          'payment.transactionId': callback.transactionId,
          'payment.confirmation': callback.confirmation,
          'payment.cardLastDigits': callback.lastDigits,
          'payment.paidAt': new Date(),
          ...(callback.installments ? { 'payment.installments': callback.installments } : {}),
        },
        $unset: { 'payment.lastError': '' },
      },
      { new: true }
    ).populate('user', 'firstName lastName email');

    if (!paid) return res.status(200).send('already processed');

    console.log(`[payments] Order ${orderId} paid (${paid.total} ILS) — ${verification.reason}`);
    res.status(200).send('ok');

    // Fulfilment runs after responding; each step logs its own failures.
    decrementStock(paid.items).catch((err) => console.error('[payments] Stock decrement error:', err));
    if (paid.coupon) {
      Coupon.findByIdAndUpdate(paid.coupon, { $inc: { usedCount: 1 } }).catch(() => {});
    }
    handleOrderPaid(paid);
  } catch (err) {
    console.error(`[payments] CallBack handling failed for order ${orderId}:`, err);
    if (!res.headersSent) res.status(500).send('error');
  }
}
