import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import { formatPrice } from '../utils/formatPrice';
import styles from './OrdersPage.module.css';

const STATUS_LABELS = {
  pending: 'ממתינה',
  paid: 'שולמה',
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
  return new Date(iso).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/account'); return; }

    orderService.myOrders()
      .then(setOrders)
      .catch(() => setError('לא הצלחנו לטעון את ההזמנות. אנא נסה שוב.'))
      .finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return <div className={`container ${styles.page}`}><p className={styles.state}>טוען הזמנות...</p></div>;
  }

  if (error) {
    return <div className={`container ${styles.page}`}><p className={styles.stateError}>{error}</p></div>;
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <h1 className="section-title">ההזמנות שלי</h1>
        <Link to="/account" className={styles.back}>חזרה לחשבון שלי</Link>
      </div>

      {orders.length === 0 ? (
        <div className={styles.empty}>
          <p>עדיין לא ביצעת הזמנות.</p>
          <Link to="/shop" className={styles.shopLink}>להמשך קנייה</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map((order) => (
            <Link key={order._id} to={`/orders/${order._id}`} className={styles.card}>
              <div className={styles.cardTop}>
                <div>
                  <div className={styles.orderId}>הזמנה #{order._id.slice(-8).toUpperCase()}</div>
                  <div className={styles.orderDate}>{formatDate(order.createdAt)}</div>
                </div>
                <span className={`${styles.statusBadge} ${STATUS_CLASS[order.status] ?? ''}`}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
              <div className={styles.cardBottom}>
                <span className={styles.itemCount}>{order.items.length} פריטים</span>
                <span className={styles.total}>{formatPrice(order.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
