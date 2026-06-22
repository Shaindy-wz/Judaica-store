import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import searchService from '../services/searchService';
import ProductGrid from '../components/product/ProductGrid';
import styles from './SearchResultsPage.module.css';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    searchService
      .search(q)
      .then((data) => setItems(data.items ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className={`container ${styles.page}`}>
      <h1 className="section-title">תוצאות חיפוש עבור: &quot;{q}&quot;</h1>
      {loading ? <p>מחפש…</p> : <ProductGrid products={items} />}
    </div>
  );
}
