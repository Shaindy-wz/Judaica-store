import { useCallback, useEffect, useState } from 'react';
import reviewService from '../services/reviewService';

export function useProductReviews(productId) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!productId) return;
    setLoading(true);
    reviewService
      .getForProduct(productId)
      .then(setReviews)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { reviews, loading, refresh };
}
