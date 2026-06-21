import { useEffect, useState } from 'react';
import productService from '../services/productService';

export function useProducts(params = {}) {
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    productService
      .list(params)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [JSON.stringify(params)]);

  return { ...data, loading, error };
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.featured().then(setProducts).catch(console.error).finally(() => setLoading(false));
  }, []);

  return { products, loading };
}

export function useNewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.newArrivals().then(setProducts).catch(console.error).finally(() => setLoading(false));
  }, []);

  return { products, loading };
}
