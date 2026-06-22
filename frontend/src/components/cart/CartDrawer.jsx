import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';
import CouponInput from './CouponInput';
import CartSummary from './CartSummary';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <div className={styles.overlay} onClick={closeDrawer}>
      <aside className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>סל הקניות שלי</h2>
          <button type="button" onClick={closeDrawer} aria-label="סגור">
            ✕
          </button>
        </div>
        {items.length === 0 ? (
          <div className={styles.empty}>
            <p>סל הקניות שלך ריק.</p>
            <Link to="/shop" className={styles.continueLink} onClick={closeDrawer}>
              המשך בקנייה
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map((item) => (
                <CartItem key={`${item.id}:${item.variantId ?? ''}`} item={item} />
              ))}
            </div>
            <CouponInput />
            <CartSummary />
          </>
        )}
      </aside>
    </div>
  );
}
