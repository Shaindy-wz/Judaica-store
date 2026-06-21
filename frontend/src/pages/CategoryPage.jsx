import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import categoryService from '../services/categoryService';
import { useProducts } from '../hooks/useProducts';
import Breadcrumb from '../components/ui/Breadcrumb';
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

  useEffect(() => {
    categoryService.getBySlug(slug).then(setCategory).catch(console.error);
  }, [slug]);

  const { items, pages, loading } = useProducts({ category: slug, page, minPrice, maxPrice });

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
          <aside className={styles.sidebar}>
            {category?.subCategories?.length > 0 && (
              <div className={styles.filterBlock}>
                <h3>קטגוריות משנה</h3>
                <ul>
                  {category.subCategories.map((sub) => (
                    <li key={sub._id}>
                      <a href={`/category/${sub.slug}`}>{sub.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className={styles.filterBlock}>
              <h3>טווח מחירים</h3>
              <div className={styles.priceInputs}>
                <input
                  type="number"
                  placeholder="מ-"
                  value={minPrice}
                  onChange={(e) => updateParam('minPrice', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="עד"
                  value={maxPrice}
                  onChange={(e) => updateParam('maxPrice', e.target.value)}
                />
              </div>
            </div>
          </aside>
          <main className={styles.main}>
            {loading ? <p>טוען מוצרים…</p> : <ProductGrid products={items} />}
            <Pagination page={page} pages={pages} onPageChange={(p) => updateParam('page', p)} />
          </main>
        </div>
      </div>
    </>
  );
}
