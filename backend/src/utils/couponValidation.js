import Coupon from '../models/Coupon.js';

export async function validateCouponForTotal(code, cartTotal) {
  const coupon = await Coupon.findOne({ code: code?.toUpperCase(), active: true });
  if (!coupon) return { error: 'קוד קופון לא קיים או לא פעיל', status: 404 };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { error: 'תוקף הקופון פג', status: 400 };
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { error: 'הקופון הגיע למגבלת השימוש', status: 400 };
  }
  if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
    return { error: `סכום ההזמנה המינימלי לקופון זה הוא ₪${coupon.minOrderAmount}`, status: 400 };
  }
  return { coupon };
}

export function calculateDiscount(subtotal, coupon) {
  if (!coupon) return 0;
  return coupon.type === 'percentage' ? subtotal * (coupon.value / 100) : Math.min(coupon.value, subtotal);
}

export async function reserveCouponUsage(couponId) {
  return Coupon.findOneAndUpdate(
    {
      _id: couponId,
      $or: [{ usageLimit: { $exists: false } }, { usageLimit: null }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }],
    },
    { $inc: { usedCount: 1 } },
    { new: true }
  );
}

export async function releaseCouponUsage(couponId) {
  await Coupon.updateOne({ _id: couponId }, { $inc: { usedCount: -1 } });
}
