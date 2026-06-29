import api from './api';

async function validate(code, cartTotal, email = null) {
  return api.post('/coupons/validate', { code, cartTotal, ...(email ? { email } : {}) });
}

export default { validate };
