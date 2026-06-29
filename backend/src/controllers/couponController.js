import User from '../models/User.js';
import { validateCouponForTotal } from '../utils/couponValidation.js';

export async function validate(req, res) {
  const { code, cartTotal = 0, email: bodyEmail } = req.body;

  // Collect all known emails for this request
  const emails = [];
  if (bodyEmail) emails.push(bodyEmail);

  // If the user is logged in, also check against their account email
  if (req.userId) {
    const user = await User.findById(req.userId).select('email');
    if (user?.email) emails.push(user.email);
  }

  const { coupon, error, status } = await validateCouponForTotal(code, cartTotal, emails);
  if (error) return res.status(status).json({ message: error });

  res.json({ code: coupon.code, type: coupon.type, value: coupon.value, minOrderAmount: coupon.minOrderAmount });
}
