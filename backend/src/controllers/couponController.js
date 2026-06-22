import { validateCouponForTotal } from '../utils/couponValidation.js';

export async function validate(req, res) {
  const { code, cartTotal = 0 } = req.body;
  const { coupon, error, status } = await validateCouponForTotal(code, cartTotal);
  if (error) return res.status(status).json({ message: error });

  res.json({ code: coupon.code, type: coupon.type, value: coupon.value, minOrderAmount: coupon.minOrderAmount });
}
