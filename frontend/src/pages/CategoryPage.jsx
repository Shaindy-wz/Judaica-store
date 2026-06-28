import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import categoryService from '../services/categoryService';
import { useProducts } from '../hooks/useProducts';
import Breadcrumb from '../components/ui/Breadcrumb';
import SortSelect from '../components/ui/SortSelect';
import ProductFilters from '../components/product/ProductFilters';
import ProductGrid from '../components/product/ProductGrid';
import Pagination from '../components/ui/Pagination';
import styles from './CategoryPage.module.css';

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(null);

  const page = Number(searchParams.get('page')) || 1;
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';
  const sort = searchParams.get('sort') ?? '';

  useEffect(() => {
    categoryService.getBySlug(slug).then(setCategory).catch(console.error);
  }, [slug]);

  const { items, pages, loading, error } = useProducts({ category: slug, page, minPrice, maxPrice, sort });

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <>
      <div className={styles.banner}>
        <h1>{category?.name ?? ''}</h1>
      </div>
      <div className="container">
        <Breadcrumb
          items={[
            { label: 'דף הבית', href: '/' },
            { label: 'חנות', href: '/shop' },
            { label: category?.name ?? '' },
          ]}
        />
        <div className={styles.layout}>
          <ProductFilters
            subCategories={category?.subCategories}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onChange={updateParam}
          />
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
    </>
  );
}
