import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';
import searchService from '../services/searchService';
import styles from './SearchResultsPage.module.css';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    searchService
      .search(q)
      .then(setResults)
      .catch(() => setError('אירעה שגיאה בחיפוש. נסה שנית.'))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {q ? `תוצאות חיפוש עבור: "${q}"` : 'חיפוש'}
        </h1>
        {!loading && results.length > 0 && (
          <span className={styles.count}>{results.length} מוצרים נמצאו</span>
        )}
      </div>

      {loading && <p className={styles.status}>מחפש…</p>}

      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && q.length >= 2 && results.length === 0 && (
        <div className={styles.empty}>
          <p>לא נמצאו תוצאות עבור &quot;{q}&quot;</p>
          <Link to="/shop" className={styles.shopLink}>עבור לחנות המלאה</Link>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <ProductGrid products={results} />
      )}
    </div>
  );
}
