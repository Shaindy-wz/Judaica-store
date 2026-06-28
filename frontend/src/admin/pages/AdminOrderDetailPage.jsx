import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAdminOrder, updateOrderStatus } from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';
import styles from './AdminOrderDetailPage.module.css';

const STATUS_LABELS = {
  pending: 'ממתין', paid: 'שולם', shipped: 'נשלח', delivered: 'נמסר', cancelled: 'בוטל',
};

const ALLOWED_TRANSITIONS = {
  paid: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
  pending: [],
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    getAdminOrder(id)
      .then((o) => {
        setOrder(o);
        setTrackingNumber(o.trackingNumber ?? '');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdateStatus() {
    if (!newStatus) return;
    if (newStatus === 'cancelled' && !window.confirm('לבטל את ההזמנה?')) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const updated = await updateOrderStatus(id, { status: newStatus, trackingNumber: trackingNumber || undefined });
      setOrder(updated);
      setNewStatus('');
      setSaveMsg('עודכן בהצלחה');
    } catch (e) {
      setSaveMsg(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className={styles.loading}>טוען...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!order) return null;

  const nextStatuses = ALLOWED_TRANSITIONS[order.status] ?? [];

  return (
    <div className={styles.page}>
      <div className={styles.backRow}>
        <Link to="/admin/orders" className={styles.back}>← חזרה להזמנות</Link>
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>
          הזמנה #{order._id.slice(-8).toUpperCase()}
        </h1>
        <span className={`${styles.badge} ${styles[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className={styles.grid}>
        {/* Order items */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>פריטים</h2>
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th>מוצר</th>
                <th>גרסה</th>
                <th>כמות</th>
                <th>מחיר</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.product?.name ?? item.name ?? '—'}</td>
                  <td className={styles.variant}>
                    {item.variantLabel ?? '—'}
                  </td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.totals}>
            <Row label="סכום ביניים" value={formatPrice(order.subtotal ?? order.total)} />
            {order.discount > 0 && <Row label="הנחה" value={`-${formatPrice(order.discount)}`} negative />}
            {order.shippingCost > 0 && <Row label="משלוח" value={formatPrice(order.shippingCost)} />}
            <Row label="סה״כ לתשלום" value={formatPrice(order.total)} bold />
          </div>
        </section>

        {/* Right column */}
        <div className={styles.sideColumn}>
          {/* Customer */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>לקוח</h2>
            {order.user ? (
              <>
                <p>{order.user.firstName} {order.user.lastName}</p>
                <p className={styles.muted}>{order.user.email}</p>
                <Link to={`/admin/customers/${order.user._id}`} className={styles.link}>
                  פרופיל לקוח
                </Link>
              </>
            ) : (
              <p className={styles.muted}>הזמנה אורח</p>
            )}
          </section>

          {/* Shipping */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>כתובת משלוח</h2>
            {order.shipping ? (
              <>
                <p>{order.shipping.name}</p>
                <p>{order.shipping.address}</p>
                <p>{order.shipping.city}{order.shipping.zipCode ? ` ${order.shipping.zipCode}` : ''}</p>
                <p>{order.shipping.phone}</p>
              </>
            ) : (
              <p className={styles.muted}>—</p>
            )}
          </section>

          {/* Status management */}
          {nextStatuses.length > 0 && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>עדכון סטטוס</h2>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className={styles.select}>
                <option value="">— בחר סטטוס —</option>
                {nextStatuses.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
              <label className={styles.label}>מספר מעקב משלוח</label>
              <input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="למשל: IL123456789"
                className={styles.input}
                dir="ltr"
              />
              <button onClick={handleUpdateStatus} disabled={!newStatus || saving} className={styles.updateBtn}>
                {saving ? 'מעדכן...' : 'עדכן'}
              </button>
              {saveMsg && <p className={styles.saveMsg}>{saveMsg}</p>}
            </section>
          )}

          {/* Invoice */}
          {order.invoiceUrl && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>חשבונית</h2>
              <a href={order.invoiceUrl} target="_blank" rel="noreferrer" className={styles.link}>
                הורד חשבונית #{order.invoiceNumber}
              </a>
            </section>
          )}

          {/* Coupon */}
          {order.coupon && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>קופון</h2>
              <p className={styles.mono}>{order.coupon.code}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold, negative }) {
  return (
    <div className={styles.totalRow}>
      <span className={bold ? styles.boldLabel : ''}>{label}</span>
      <span className={`${bold ? styles.boldValue : ''} ${negative ? styles.negative : ''}`}>{value}</span>
    </div>
  );
}
