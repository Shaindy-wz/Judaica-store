import Coupon from '../models/Coupon.js';

function resolveMode(coupon) {
  if (coupon.couponMode) return coupon.couponMode;
  return coupon.onePerCustomer ? 'per_customer' : 'shared';
}

function normaliseEmails(emails) {
  const arr = Array.isArray(emails) ? emails : emails ? [emails] : [];
  return [...new Set(arr.map((e) => e.toLowerCase().trim()).filter(Boolean))];
}

export async function validateCouponForTotal(code, cartTotal, emails = []) {
  const coupon = await Coupon.findOne({ code: code?.toUpperCase(), active: true });
  if (!coupon) return { error: 'קוד קופון לא קיים או לא פעיל', status: 404 };

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { error: 'תוקף הקופון פג', status: 400 };
  }
  if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
    return { error: `סכום ההזמנה המינימלי לקופון זה הוא ₪${coupon.minOrderAmount}`, status: 400 };
  }

  const mode = resolveMode(coupon);
  const normalisedEmails = normaliseEmails(emails);

  if (mode === 'shared') {
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { error: 'הקופון הגיע למגבלת השימוש', status: 400 };
    }
  } else if (mode === 'per_customer') {
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { error: 'הקופון הגיע למגבלת השימוש', status: 400 };
    }
    const primaryEmail = normalisedEmails[0];
    if (primaryEmail && coupon.usedByEmails.includes(primaryEmail)) {
      return { error: 'כבר השתמשת בקופון זה בעבר', status: 400 };
    }
  } else if (mode === 'personal') {
    if (!normalisedEmails.length) {
      return { error: 'קוד קופון זה מיועד ללקוח ספציפי — הזן כתובת אימייל בדף התשלום', status: 400 };
    }
    if (coupon.forEmail && !normalisedEmails.includes(coupon.forEmail)) {
      return { error: 'קוד קופון זה אינו שייך לאימייל זה', status: 400 };
    }
    if (coupon.usedCount >= 1) {
      return { error: 'קוד קופון זה כבר נוצל', status: 400 };
    }
  }

  return { coupon };
}

export function calculateDiscount(subtotal, coupon) {
  if (!coupon) return 0;
  return coupon.type === 'percentage'
    ? subtotal * (coupon.value / 100)
    : Math.min(coupon.value, subtotal);
}

export async function reserveCouponUsage(couponId, email = null) {
  const coupon = await Coupon.findById(couponId).select('couponMode onePerCustomer usageLimit');
  if (!coupon) return null;

  const mode = resolveMode(coupon);
  const trackEmail = (mode === 'per_customer' || mode === 'personal') && email;

  const update = { $inc: { usedCount: 1 } };
  if (trackEmail) update.$addToSet = { usedByEmails: email.toLowerCase().trim() };

  return Coupon.findOneAndUpdate(
    {
      _id: couponId,
      $or: [
        { usageLimit: { $exists: false } },
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
      ],
    },
    update,
    { new: true }
  );
}

export async function releaseCouponUsage(couponId, email = null) {
  const coupon = await Coupon.findById(couponId).select('couponMode onePerCustomer');
  const mode = coupon ? resolveMode(coupon) : 'per_customer';
  const trackEmail = (mode === 'per_customer' || mode === 'personal') && email;

  const update = { $inc: { usedCount: -1 } };
  if (trackEmail) update.$pull = { usedByEmails: email.toLowerCase().trim() };
  await Coupon.updateOne({ _id: couponId }, update);
}
