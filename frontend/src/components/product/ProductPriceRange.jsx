import { formatPrice } from '../../utils/formatPrice';
import styles from './ProductPriceRange.module.css';

export default function ProductPriceRange({ price, maxPrice, originalPrice }) {
  return (
    <div className={styles.price}>
      {maxPrice && maxPrice !== price ? (
        <span className={styles.current}>
          {formatPrice(price)} – {formatPrice(maxPrice)}
        </span>
      ) : (
        <>
          <span className={styles.current}>{formatPrice(price)}</span>
          {originalPrice && <span className={styles.original}>{formatPrice(originalPrice)}</span>}
        </>
      )}
    </div>
  );
}
