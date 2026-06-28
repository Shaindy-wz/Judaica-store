import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import SortSelect from '../components/ui/SortSelect';
import ProductFilters from '../components/product/ProductFilters';
import ProductGrid from '../components/product/ProductGrid';
import Pagination from '../components/ui/Pagination';
import styles from './ShopPage.module.css';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') ?? '';
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';

  const { items, pages, loading, error } = useProducts({ page, sort, minPrice, maxPrice });

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div className={`container ${styles.page}`}>
      <h1 className="section-title">כל המוצרים</h1>
      <div className={styles.layout}>
        <ProductFilters minPrice={minPrice} maxPrice={maxPrice} onChange={updateParam} />
        <main className={styles.main}>
          <div className={styles.toolbar}>
            <SortSelect value={sort} onChange={(value) => updateParam('sort', value)} />
          </div>
          {error ? (
            <p className={styles.error}>אירעה שגיאה בטעינת המוצרים. נסו לרענן את העמוד.</p>
          ) : loading ? (
            <p>טוען מוצרים…</p>
          ) : (
            <ProductGrid products={items} />
          )}
          <Pagination page={page} pages={pages} onPageChange={(p) => updateParam('page', p)} />
        </main>
      </div>
    </div>
  );
}
