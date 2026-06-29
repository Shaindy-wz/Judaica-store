import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../services/orderService';
import { formatPrice } from '../utils/formatPrice';
import styles from './OrderDetailPage.module.css';

const STATUS_LABELS = {
  pending: 'ממתינה לאישור',
  paid: 'שולמה — בהכנה',
  shipped: 'נשלחה',
  delivered: 'נמסרה',
  cancelled: 'בוטלה',
};

const STATUS_CLASS = {
  pending: styles.statusPending,
  paid: styles.statusPaid,
  shipped: styles.statusShipped,
  delivered: styles.statusDelivered,
  cancelled: styles.statusCancelled,
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('he-IL', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orderService.getById(id)
      .then(setOrder)
      .catch((err) => setError(err.message || 'לא הצלחנו לטעון את ההזמנה.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className={`container ${styles.page}`}><p className={styles.state}>טוען הזמנה...</p></div>;
  }

  if (error || !order) {
    return (
      <div className={`container ${styles.page}`}>
        <p className={styles.stateError}>{error || 'הזמנה לא נמצאה'}</p>
        <Link to="/orders" className={styles.back}>חזרה להזמנות שלי</Link>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>

      {/* Success banner — shown when navigated straight from checkout */}
      {order.status === 'paid' && (
        <div className={styles.successBanner} role="status">
          <span className={styles.successIcon}>✓</span>
          <div>
            <strong>ההזמנה התקבלה! הפריטים בדרך אליך 🚚</strong>
            <span>מספר הזמנה: #{order._id.slice(-8).toUpperCase()}</span>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>הזמנה #{order._id.slice(-8).toUpperCase()}</h1>
          <p className={styles.date}>{formatDate(order.createdAt)}</p>
        </div>
        <Link to="/orders" className={styles.back}>כל ההזמנות שלי</Link>
      </div>

      <div className={styles.layout}>
        {/* Items */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>פריטים</h2>
          <ul className={styles.items}>
            {order.items.map((item, i) => (
              <li key={i} className={styles.item}>
                {item.image && (
                  <img src={item.image} alt={item.name} className={styles.itemImg} />
                )}
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemMeta}>כמות: {item.quantity}</span>
                </div>
                <span className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span>סכום ביניים</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className={styles.totalRow}>
                <span>
                  הנחה
                  {order.couponCode && (
                    <span className={styles.couponBadge}>{order.couponCode}</span>
                  )}
                </span>
                <span className={styles.discount}>-{formatPrice(order.discount)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className={styles.savingsNote}>
                🎉 חסכת {formatPrice(order.discount)} בהזמנה זו!
              </div>
            )}
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span>סה"כ שולם</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </section>

        {/* Details sidebar */}
        <aside className={styles.aside}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>סטטוס</h2>
            <span className={`${styles.statusBadge} ${STATUS_CLASS[order.status] ?? ''}`}>
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
            {order.trackingNumber && (
              <p className={styles.tracking}>מספר מעקב: <strong>{order.trackingNumber}</strong></p>
            )}
          </section>

          {order.shipping && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>כתובת למשלוח</h2>
              <address className={styles.address}>
                <div>{order.shipping.name}</div>
                <div>{order.shipping.phone}</div>
                <div>{order.shipping.address}</div>
                <div>{order.shipping.city}{order.shipping.zipCode ? ` ${order.shipping.zipCode}` : ''}</div>
              </address>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
