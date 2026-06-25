import api from './api';
import { normalizeHebrew } from '../utils/hebrewSearchNormalize';

async function search(query) {
  const normalized = normalizeHebrew(query);
  return api.get(`/search?q=${encodeURIComponent(normalized)}`);
}

export default { search };
