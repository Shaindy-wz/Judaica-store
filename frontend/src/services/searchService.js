import api from './api';
import { normalizeHebrew } from '../utils/hebrewSearchNormalize';

async function search(query) {
  const normalized = normalizeHebrew(query);
  if (normalized.length < 2) return [];
  return api.get(`/search?q=${encodeURIComponent(normalized)}`);
}

export default { search };
