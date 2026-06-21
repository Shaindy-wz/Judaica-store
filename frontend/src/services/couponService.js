import api from './api';

async function validate(code) {
  return api.post('/coupons/validate', { code });
}

export default { validate };
