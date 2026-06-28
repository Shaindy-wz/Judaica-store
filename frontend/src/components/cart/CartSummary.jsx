import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatPrice';
import Button from '../ui/Button';
import styles from './CartSummary.module.css';

export default function CartSummary({ checkoutHref = '/checkout' }) {
  const { subtotal, discount, total } = useCart();

  return (
    <div className={styles.summary}>
      <div className={styles.row}>
        <span>סכום ביניים</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      {discount > 0 && (
        <div className={styles.row}>
          <span>הנחה</span>
          <span>-{formatPrice(discount)}</span>
        </div>
      )}
      <div className={styles.total}>
        <span>סה"כ</span>
        <span>{formatPrice(total)}</span>
      </div>
      <Button href={checkoutHref} variant="primary">
        להמשך לתשלום
      </Button>
    </div>
  );
}
