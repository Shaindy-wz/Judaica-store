import { useFeaturedProducts } from '../../hooks/useProducts';
import ProductGrid from '../product/ProductGrid';
import styles from './FeaturedProducts.module.css';

export default function FeaturedProducts() {
  const { products, loading } = useFeaturedProducts();

  if (loading || !products.length) return null;

  return (
    <section className={styles.section}>
      <h2 className="section-title">מוצרים מומלצים</h2>
      <ProductGrid products={products} />
    </section>
  );
}
