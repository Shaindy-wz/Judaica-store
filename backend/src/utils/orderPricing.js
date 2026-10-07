import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

const MAX_QUANTITY_PER_LINE = 99;

function roundMoney(amount) {
  return Math.round(amount * 100) / 100;
}

// Keeps only the fields we accept from the client and rejects quantities or
// ids that would otherwise produce a negative total or a Mongoose CastError.
export function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) return { error: 'ההזמנה ריקה' };

  const normalized = [];
  for (const item of items) {
    const quantity = Number(item?.quantity);
    if (!mongoose.isValidObjectId(item?.product)) return { error: 'מוצר לא תקין בסל' };
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_LINE) {
      return { error: 'כמות לא תקינה בסל' };
    }
    normalized.push({
      product: item.product,
      variantId: item.variantId || undefined,
      name: String(item.name ?? ''),
      image: String(item.image ?? ''),
      quantity,
    });
  }
  return { items: normalized };
}

// Validates that every item has sufficient stock. Returns array of Hebrew error strings.
export async function checkStock(items) {
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

// Fetches real prices and names from DB, applies coupon. Returns verified totals + mutates item.price/name.
export async function recomputeTotals(items, couponCode) {
  let subtotal = 0;
  for (const item of items) {
    const prod = await Product.findById(item.product).select('name basePrice variants');
    if (!prod) continue;
    const unitPrice = item.variantId
      ? (prod.variants.id(item.variantId)?.price ?? prod.basePrice)
      : prod.basePrice;
    item.price = unitPrice;
    item.name = prod.name;
    subtotal += unitPrice * item.quantity;
  }

  let discount = 0;
  let couponId;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase(), active: true });
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

  subtotal = roundMoney(subtotal);
  discount = roundMoney(discount);
  return { subtotal, discount, total: roundMoney(subtotal - discount), couponId };
}

export async function decrementStock(items) {
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
