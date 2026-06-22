import Coupon from '../models/Coupon.js';

export async function list(req, res) {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
}

export async function create(req, res) {
  const { code, type, value, minOrderAmount, expiresAt, usageLimit, active } = req.body;
  const coupon = await Coupon.create({ code, type, value, minOrderAmount, expiresAt, usageLimit, active });
  res.status(201).json(coupon);
}

export async function update(req, res) {
  const { code, type, value, minOrderAmount, expiresAt, usageLimit, active } = req.body;
  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    { code, type, value, minOrderAmount, expiresAt, usageLimit, active },
    { new: true, runValidators: true }
  );
  if (!coupon) return res.status(404).json({ message: 'הקופון לא נמצא' });
  res.json(coupon);
}

export async function remove(req, res) {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return res.status(404).json({ message: 'הקופון לא נמצא' });
  res.status(204).end();
}
