import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import orderService from '../services/orderService';
import { formatPrice } from '../utils/formatPrice';
import CouponInput from '../components/cart/CouponInput';
import styles from './CheckoutPage.module.css';

const EMPTY_ADDRESS = { name: '', email: '', phone: '', address: '', city: '', zipCode: '' };

export default function CheckoutPage() {
  const { items, coupon, subtotal, discount, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [addr, setAddr] = useState(EMPTY_ADDRESS);
  const [paying, setPaying] = useState(false);
  const [stockErrors, setStockErrors] = useState([]);
  const [generalError, setGeneralError] = useState('');

  function setField(field, value) {
    setAddr((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStockErrors([]);
    setGeneralError('');
    setPaying(true);

    try {
      const payload = {
        items: items.map((item) => ({
          product: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image ?? '',
          variantId: item.variantId ?? undefined,
        })),
        shippingAddress: addr,
        couponCode: coupon?.code,
      };

      const order = await orderService.mockPay(payload);
      clearCart();
      navigate(`/orders/${order._id}`);
    } catch (err) {
      if (err.outOfStock) {
        setStockErrors(err.outOfStock);
      } else {
        setGeneralError(err.message || 'אירעה שגיאה, אנא נסה שוב.');
      }
    } finally {
      setPaying(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className={`container ${styles.page}`}>
        <p className={styles.empty}>סל הקניות שלך ריק. <Link to="/shop">להמשך קנייה</Link></p>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <h1 className="section-title">תשלום</h1>

      <div className={styles.layout}>
        {/* Shipping form */}
        <form onSubmit={handleSubmit} className={styles.formSection} noValidate>
          <h2 className={styles.sectionTitle}>פרטי משלוח</h2>

          {stockErrors.length > 0 && (
            <div className={styles.stockError} role="alert">
              <strong>לא ניתן להשלים את ההזמנה — בעיות מלאי:</strong>
              <ul>
                {stockErrors.map((msg, i) => <li key={i}>{msg}</li>)}
              </ul>
              <Link to="/cart">חזור לסל לעדכון הכמויות</Link>
            </div>
          )}

          {generalError && (
            <p className={styles.generalError} role="alert">{generalError}</p>
          )}

          <div className={styles.field}>
            <label htmlFor="name">שם מלא *</label>
            <input
              id="name" type="text" required
              value={addr.name} onChange={(e) => setField('name', e.target.value)}
              placeholder="ישראל ישראלי"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">אימייל *</label>
            <input
              id="email" type="email" required
              value={addr.email} onChange={(e) => setField('email', e.target.value)}
              placeholder="israel@example.com"
              dir="ltr"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="phone">טלפון *</label>
            <input
              id="phone" type="tel" required
              value={addr.phone} onChange={(e) => setField('phone', e.target.value)}
              placeholder="050-0000000"
              dir="ltr"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="address">כתובת *</label>
            <input
              id="address" type="text" required
              value={addr.address} onChange={(e) => setField('address', e.target.value)}
              placeholder="רחוב הרצל 1, דירה 5"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="city">עיר *</label>
              <input
                id="city" type="text" required
                value={addr.city} onChange={(e) => setField('city', e.target.value)}
                placeholder="תל אביב"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="zipCode">מיקוד</label>
              <input
                id="zipCode" type="text"
                value={addr.zipCode} onChange={(e) => setField('zipCode', e.target.value)}
                placeholder="6100000"
                dir="ltr"
              />
            </div>
          </div>

          <button type="submit" className={styles.payBtn} disabled={paying}>
            {paying ? 'מעבד הזמנה...' : `לתשלום — ${formatPrice(total)}`}
          </button>
        </form>

        {/* Order summary */}
        <aside className={styles.summary}>
          <h2 className={styles.sectionTitle}>סיכום הזמנה</h2>

          <ul className={styles.itemList}>
            {items.map((item) => (
              <li key={`${item.id}:${item.variantId ?? ''}`} className={styles.item}>
                {item.image && (
                  <img src={item.image} alt={item.name} className={styles.itemImg} />
                )}
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemQty}>× {item.quantity}</span>
                </div>
                <span className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <CouponInput />

          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span>סכום ביניים</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className={styles.totalRow}>
                <span>הנחה {coupon?.code && `(${coupon.code})`}</span>
                <span className={styles.discount}>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span>סה"כ לתשלום</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
