import api from './api';

async function validate(code, cartTotal) {
  return api.post('/coupons/validate', { code, cartTotal });
}

export default { validate };
