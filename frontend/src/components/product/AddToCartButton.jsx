import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import styles from './AddToCartButton.module.css';

export default function AddToCartButton({ product, variant, disabled }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addToCart(
      {
        id: product._id,
        name: product.name,
        price: variant?.price ?? product.basePrice,
        image: product.images?.[0],
        slug: product.slug,
      },
      1,
      variant?.id ?? variant?._id ?? null
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button type="button" className={styles.button} onClick={handleClick} disabled={disabled}>
      {added ? 'נוסף לסל ✓' : 'הוסף לסל'}
    </button>
  );
}
