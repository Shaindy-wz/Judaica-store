import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

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

// Validates that every item has sufficient stock. Returns array of Hebrew error strings.
async function checkStock(items) {
  const errors = [];
  for (const item of items) {
    const prod = await Product.findById(item.product).select('name inStock variants stockQuantity');
    if (!prod) {
      errors.push('מוצר לא נמצא במערכת');
      continue;
    }
    if (item.variantId) {
      const variant = prod.variants.id(item.variantId);
      if (!variant) { errors.push(`${prod.name}: גרסה לא נמצאה`); continue; }
      if (!variant.inStock) { errors.push(`${prod.name}: אזל מהמלאי`); continue; }
      if (variant.stockQuantity != null && variant.stockQuantity < item.quantity) {
        errors.push(`${prod.name}: נותרו רק ${variant.stockQuantity} יחידות במלאי`);
      }
    } else {
      if (!prod.inStock) { errors.push(`${prod.name}: אזל מהמלאי`); continue; }
      if (prod.stockQuantity != null && prod.stockQuantity < item.quantity) {
        errors.push(`${prod.name}: נותרו רק ${prod.stockQuantity} יחידות במלאי`);
      }
    }
  }
  return errors;
}

// Fetches real prices from DB, applies coupon. Returns verified totals + mutates item.price.
async function recomputeTotals(items, couponCode) {
  let subtotal = 0;
  for (const item of items) {
    const prod = await Product.findById(item.product).select('basePrice variants');
    if (!prod) continue;
    const unitPrice = item.variantId
      ? (prod.variants.id(item.variantId)?.price ?? prod.basePrice)
      : prod.basePrice;
    item.price = unitPrice;
    subtotal += unitPrice * item.quantity;
  }

  let discount = 0;
  let couponId;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
    if (
      coupon &&
      (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
      (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
      (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount)
    ) {
      discount = coupon.type === 'percentage'
        ? subtotal * (coupon.value / 100)
        : Math.min(coupon.value, subtotal);
      couponId = coupon._id;
    }
  }

  return { subtotal, discount, total: subtotal - discount, couponId };
}

async function decrementStock(items) {
  await Promise.all(
    items.map(async (item) => {
      try {
        const prod = await Product.findById(item.product);
        if (!prod) return;

        if (item.variantId) {
          const variant = prod.variants.id(item.variantId);
          if (variant && variant.stockQuantity != null) {
            variant.stockQuantity = Math.max(0, variant.stockQuantity - item.quantity);
            if (variant.stockQuantity === 0) variant.inStock = false;
          }
          prod.inStock = prod.variants.some((v) => v.inStock);
        } else {
          if (prod.stockQuantity != null) {
            prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
            if (prod.stockQuantity === 0) prod.inStock = false;
          }
        }

        await prod.save();
      } catch (err) {
        console.error(`Failed to update stock for product ${item.product}:`, err.message);
      }
    })
  );
}

export async function mockPay(req, res) {
  const { items, shippingAddress, couponCode } = req.body;

  if (!items?.length) return res.status(400).json({ message: 'Order must contain items' });
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
