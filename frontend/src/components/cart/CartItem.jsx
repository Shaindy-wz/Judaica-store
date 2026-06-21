import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatPrice';
import styles from './CartItem.module.css';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className={styles.item}>
      <img src={item.image} alt={item.name} className={styles.image} />
      <div className={styles.info}>
        <span className={styles.name}>{item.name}</span>
        <span className={styles.price}>{formatPrice(item.price)}</span>
        <div className={styles.qty}>
          <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId)}>
            −
          </button>
          <span>{item.quantity}</span>
          <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId)}>
            +
          </button>
        </div>
      </div>
      <button
        type="button"
        className={styles.remove}
        aria-label="הסר מהסל"
        onClick={() => removeFromCart(item.id, item.variantId)}
      >
        ✕
      </button>
    </div>
  );
}
