import api from './api';

function getConfig() {
  return api.get('/payments/config');
}

// New order: { items, shippingAddress, couponCode, installments }
// Retry on the same pending order: { orderId, clientToken, installments }
function createSession(payload) {
  return api.post('/payments/create-session', payload);
}

function getStatus(orderId, clientToken) {
  return api.get(`/payments/${orderId}/status?token=${encodeURIComponent(clientToken)}`);
}

export default { getConfig, createSession, getStatus };
