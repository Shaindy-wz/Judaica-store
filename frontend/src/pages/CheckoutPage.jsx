import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import CancellationRightsNotice from '../components/checkout/CancellationRightsNotice';
import PaymentFrame from '../components/checkout/PaymentFrame';
import business from '../config/business';
import { formatPrice } from '../utils/formatPrice';
import { productImageSrc, handleImageError } from '../utils/productImage';
import styles from './CheckoutPage.module.css';

// email stays undefined until typed, so a logged-in customer's address is used by default.
const EMPTY_ADDRESS = { name: '', phone: '', email: undefined, address: '', city: '', zipCode: '' };

export default function CheckoutPage() {
  const { items, coupon, subtotal, discount, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addr, setAddr] = useState(EMPTY_ADDRESS);
  const [installments, setInstallments] = useState(1);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [configError, setConfigError] = useState('');
  const [session, setSession] = useState(null);
  const [result, setResult] = useState(null); // { orderId, confirmed }
  const [paying, setPaying] = useState(false);
  const [stockErrors, setStockErrors] = useState([]);
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    paymentService.getConfig()
      .then(setPaymentConfig)
      .catch(() => setConfigError('לא הצלחנו לטעון את אפשרויות התשלום. רעננו את הדף ונסו שוב.'));
  }, []);

  const email = addr.email ?? user?.email ?? '';

  function setField(field, value) {
    setAddr((prev) => ({ ...prev, [field]: value }));
  }

  function buildPayload() {
    return {
      items: items.map((item) => ({
        product: item.id,
        name: item.name,
        quantity: item.quantity,
        image: item.image ?? '',
        variantId: item.variantId ?? undefined,
      })),
      shippingAddress: { ...addr, email },
      couponCode: coupon?.code,
      installments,
    };
  }

  function finish(orderId, confirmed) {
    clearCart();
    if (user && confirmed) navigate(`/orders/${orderId}`);
    else setResult({ orderId, confirmed });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStockErrors([]);
    setGeneralError('');
    setPaying(true);

    try {
      if (paymentConfig.provider === 'nedarim') {
        setSession(await paymentService.createSession(buildPayload()));
      } else {
        const order = await orderService.mockPay(buildPayload());
        finish(order._id, true);
      }
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

  // A declined card gets a fresh Nedarim transaction for the same pending order.
  async function handleRetry() {
    const next = await paymentService.createSession({
      orderId: session.orderId,
      clientToken: session.clientToken,
      installments,
    });
    setSession(next);
  }

  if (result) {
    const orderNumber = String(result.orderId).slice(-8).toUpperCase();
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.resultBox} role="status">
          <span className={styles.resultIcon} aria-hidden="true">✓</span>
          <h1 className={styles.resultTitle}>
            {result.confirmed ? 'תודה! ההזמנה התקבלה' : 'התשלום התקבל ונמצא באימות'}
          </h1>
          <p>מספר הזמנה: <strong>#{orderNumber}</strong></p>
          <p>
            {result.confirmed
              ? 'אישור הזמנה וחשבונית יישלחו לכתובת האימייל שהזנתם.'
              : 'האישור הסופי מחברת האשראי מתעכב מעט. אישור הזמנה יישלח לאימייל שלכם ברגע שיתקבל — אין צורך לשלם שוב.'}
          </p>
          <p className={styles.resultHelp}>
            לשאלות: <a href={`tel:${business.phoneDial}`} dir="ltr">{business.phone}</a>
          </p>
          <Link to="/shop" className={styles.resultLink}>להמשך קנייה</Link>
        </div>
      </div>
    );
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
        <div className={styles.mainColumn}>
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

          {/* Locked once a payment transaction exists, since its amount and details are fixed. */}
          <fieldset className={styles.fieldset} disabled={Boolean(session)}>
          <div className={styles.field}>
            <label htmlFor="name">שם מלא *</label>
            <input
              id="name" type="text" required
              value={addr.name} onChange={(e) => setField('name', e.target.value)}
              placeholder="ישראל ישראלי"
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
            <label htmlFor="email">אימייל לקבלת אישור וחשבונית *</label>
            <input
              id="email" type="email" required autoComplete="email"
              value={email} onChange={(e) => setField('email', e.target.value)}
              placeholder="name@example.com"
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

          {paymentConfig?.provider === 'nedarim' && paymentConfig.maxInstallments > 1 && (
            <div className={styles.field}>
              <label htmlFor="installments">מספר תשלומים</label>
              <select
                id="installments"
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
              >
                {Array.from({ length: paymentConfig.maxInstallments }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n === 1 ? 'תשלום אחד' : `${n} תשלומים (${formatPrice(total / n)} לחודש)`}
                  </option>
                ))}
              </select>
            </div>
          )}
          </fieldset>

          <CancellationRightsNotice />

          {configError && <p className={styles.generalError} role="alert">{configError}</p>}
          {!paymentConfig && !configError && <p className={styles.configState} role="status">טוען אפשרויות תשלום...</p>}
          {paymentConfig && !paymentConfig.provider && (
            <p className={styles.generalError} role="alert">
              התשלום באתר אינו זמין כרגע. ניתן להזמין בטלפון{' '}
              <a href={`tel:${business.phoneDial}`} dir="ltr">{business.phone}</a>
            </p>
          )}

          {!session && paymentConfig?.provider && (
            <button type="submit" className={styles.payBtn} disabled={paying}>
              {paying ? 'מכין תשלום מאובטח...' : `המשך לתשלום — ${formatPrice(total)}`}
            </button>
          )}
        </form>

        {session && (
          <div className={styles.formSection}>
            <PaymentFrame
              session={session}
              onRetry={handleRetry}
              onPaid={() => finish(session.orderId, true)}
              onConfirmationDelayed={() => finish(session.orderId, false)}
            />
          </div>
        )}
        </div>

        {/* Order summary */}
        <aside className={styles.summary}>
          <h2 className={styles.sectionTitle}>סיכום הזמנה</h2>

          <ul className={styles.itemList}>
            {items.map((item) => (
              <li key={`${item.id}:${item.variantId ?? ''}`} className={styles.item}>
                <img
                  src={productImageSrc(item.image)}
                  alt={item.name}
                  className={styles.itemImg}
                  onError={handleImageError}
                />
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemQty}>× {item.quantity}</span>
                </div>
                <span className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

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
