import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import StarRating from '../ui/StarRating';
import { formatPrice } from '../../utils/formatPrice';
import styles from './ProductCard.module.css';

export default function ProductCard({
  id,
  name,
  price,
  maxPrice,
  originalPrice,
  hasVariants,
  image,
  badge,
  rating,
  reviewCount,
  slug,
}) {
  const { addToCart } = useCart();

  return (
    <div className={styles.card}>
      {badge && <span className={styles.badge}>{badge}</span>}
      <Link to={`/product/${slug}`}>
        <img src={image} alt={name} className={styles.image} />
      </Link>
      <div className={styles.info}>
        <h3 className={styles.name}>
          <Link to={`/product/${slug}`}>{name}</Link>
        </h3>
        {rating != null && <StarRating value={rating} count={reviewCount} size="sm" />}
        <div className={styles.price}>
          {maxPrice ? (
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
      </div>
      {hasVariants ? (
        <Link to={`/product/${slug}`} className={styles.addBtn}>
          בחר אפשרויות
        </Link>
      ) : (
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => addToCart({ id, name, price, image, slug })}
        >
          הוסף לסל
        </button>
      )}
    </div>
  );
}
