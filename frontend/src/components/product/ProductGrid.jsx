import ProductCard from './ProductCard';
import styles from './ProductGrid.module.css';

export default function ProductGrid({ products }) {
  if (!products.length) {
    return <p className={styles.empty}>לא נמצאו מוצרים.</p>;
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard
          key={product._id ?? product.id}
          id={product._id ?? product.id}
          name={product.name}
          slug={product.slug}
          image={product.images?.[0] ?? product.image}
          price={product.priceRange?.min ?? product.basePrice ?? product.price}
          maxPrice={
            product.priceRange && product.priceRange.min !== product.priceRange.max
              ? product.priceRange.max
              : undefined
          }
          originalPrice={product.originalPrice}
          hasVariants={product.hasVariants}
          badge={product.badge}
        />
      ))}
    </div>
  );
}
