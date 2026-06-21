import api from './api';

async function search(query) {
  return api.get(`/search?q=${encodeURIComponent(query)}`);
}

export default { search };
