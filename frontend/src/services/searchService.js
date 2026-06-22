import api from './api';
import { normalizeHebrew } from '../utils/hebrewSearchNormalize';

async function search(query) {
  const normalized = normalizeHebrew(query);
  if (normalized.length < 2) return { items: [], total: 0 };
  return api.get(`/search?q=${encodeURIComponent(normalized)}`);
}

export default { search };
