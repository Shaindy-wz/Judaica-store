import Coupon from '../../models/Coupon.js';

export async function listCoupons(req, res) {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
}

function normaliseCouponBody(body) {
  const data = { ...body };
  if (data.maxUses !== undefined && data.usageLimit === undefined) {
    data.usageLimit = data.maxUses;
  }
  delete data.maxUses;
  // Personal coupons are always single-use; enforce on the server regardless of what the form sends
  if (data.couponMode === 'personal') {
    data.usageLimit = 1;
  }
  return data;
}

export async function createCoupon(req, res) {
  const coupon = await Coupon.create(normaliseCouponBody(req.body));
  res.status(201).json(coupon);
}

export async function updateCoupon(req, res) {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, normaliseCouponBody(req.body), {
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

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;

export async function generateCode(req, res) {
  let code;
  let attempts = 0;
  do {
    if (++attempts > 20) return res.status(500).json({ message: 'לא ניתן ליצור קוד ייחודי' });
    code = Array.from({ length: CODE_LENGTH }, () =>
      CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
    ).join('');
  } while (await Coupon.exists({ code }));
  res.json({ code });
}
