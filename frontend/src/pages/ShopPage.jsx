import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductGrid from '../components/product/ProductGrid';
import Pagination from '../components/ui/Pagination';
import styles from './ShopPage.module.css';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') ?? '';

  const { items, pages, loading } = useProducts({ page, sort });

  const updatePage = (nextPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', nextPage);
    setSearchParams(next);
  };

  return (
    <div className={`container ${styles.page}`}>
      <h1 className="section-title">כל המוצרים</h1>
      {loading ? <p>טוען מוצרים…</p> : <ProductGrid products={items} />}
      <Pagination page={page} pages={pages} onPageChange={updatePage} />
    </div>
  );
}
