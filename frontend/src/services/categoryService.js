import api from './api';

function list() {
  return api.get('/categories');
}

function getBySlug(slug) {
  return api.get(`/categories/${slug}`);
}

export default { list, getBySlug };
