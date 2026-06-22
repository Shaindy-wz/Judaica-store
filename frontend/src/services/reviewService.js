import api from './api';

function getForProduct(productId) {
  return api.get(`/products/${productId}/reviews`);
}

function submit(productId, payload) {
  return api.post(`/products/${productId}/reviews`, payload);
}

function getSummary() {
  return api.get('/reviews/summary');
}

export default { getForProduct, submit, getSummary };
