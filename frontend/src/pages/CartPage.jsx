import { useCart } from '../context/CartContext';
import CartItem from '../components/cart/CartItem';
import CouponInput from '../components/cart/CouponInput';
import CartSummary from '../components/cart/CartSummary';
import styles from './CartPage.module.css';

export default function CartPage() {
  const { items } = useCart();

  return (
    <div className={`container ${styles.page}`}>
      <h1 className="section-title">סל הקניות שלי</h1>
      {items.length === 0 ? (
        <p className={styles.empty}>סל הקניות שלך ריק.</p>
      ) : (
        <div className={styles.layout}>
          <div className={styles.items}>
            {items.map((item) => (
              <CartItem key={`${item.id}:${item.variantId ?? ''}`} item={item} />
            ))}
          </div>
          <div className={styles.side}>
            <CouponInput />
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  );
}
