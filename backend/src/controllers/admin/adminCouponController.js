import Coupon from '../../models/Coupon.js';

export async function listCoupons(req, res) {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
}

export async function createCoupon(req, res) {
  const coupon = await Coupon.create(req.body);
  res.status(201).json(coupon);
}

export async function updateCoupon(req, res) {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
  res.json(coupon);
}

export async function deleteCoupon(req, res) {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
  res.json({ message: 'Coupon deleted' });
}
