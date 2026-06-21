import Coupon from '../models/Coupon.js';

export async function validate(req, res) {
  const { code } = req.body;
  const coupon = await Coupon.findOne({ code: code?.toUpperCase(), active: true });

  if (!coupon) return res.status(404).json({ message: 'קוד קופון לא קיים או לא פעיל' });
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return res.status(400).json({ message: 'תוקף הקופון פג' });
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({ message: 'הקופון הגיע למגבלת השימוש' });
  }

  res.json({ code: coupon.code, type: coupon.type, value: coupon.value, minOrderAmount: coupon.minOrderAmount });
}
