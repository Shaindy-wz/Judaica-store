import { Link } from 'react-router-dom';
import { useNewArrivals } from '../../hooks/useProducts';
import ProductGrid from '../product/ProductGrid';
import styles from './NewArrivalsStrip.module.css';

export default function NewArrivalsStrip() {
  const { products, loading } = useNewArrivals();

  if (loading || !products.length) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className="section-title">מוצרים חדשים</h2>
          <p className={styles.subtitle}>הגיעו ממש עכשיו</p>
        </div>
        <Link to="/shop?sort=newest" className={styles.link}>
          הצג הכל
        </Link>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
