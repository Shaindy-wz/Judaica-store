import api from './api';

function list(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  ).toString();
  return api.get(`/products${query ? `?${query}` : ''}`);
}

function getBySlug(slug) {
  return api.get(`/products/${slug}`);
}

function featured() {
  return api.get('/products/featured');
}

function newArrivals() {
  return api.get('/products/new');
}

export default { list, getBySlug, featured, newArrivals };
