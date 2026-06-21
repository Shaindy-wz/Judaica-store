import { useEffect, useState } from 'react';
import categoryService from '../services/categoryService';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService.list().then(setCategories).catch(console.error).finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
