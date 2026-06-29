import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';
import styles from './AdminDashboardPage.module.css';

const STATUS_LABELS = {
  pending: 'ממתין',
  paid: 'שולם',
  shipped: 'נשלח',
  delivered: 'נמסר',
  cancelled: 'בוטל',
};

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className={styles.loading}>טוען...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>לוח בקרה</h1>

      <div className={styles.stats}>
        <StatCard label="הכנסות היום" value={formatPrice(data.revenue.today)} />
        <StatCard label="הכנסות השבוע" value={formatPrice(data.revenue.week)} />
        <StatCard label="הכנסות החודש" value={formatPrice(data.revenue.month)} />
        <StatCard label="הזמנות חדשות היום" value={data.newOrdersToday} />
      </div>

      <h2 className={styles.sectionTitle}>הזמנות אחרונות</h2>
      <div className={styles.table}>
        <table>
          <thead>
            <tr>
              <th>מס׳ הזמנה</th>
              <th>לקוח</th>
              <th>סה״כ</th>
              <th>סטטוס</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.recentOrders.map((o) => (
              <tr key={o._id}>
                <td className={styles.mono}>{o._id.slice(-8).toUpperCase()}</td>
                <td>{o.user ? `${o.user.firstName} ${o.user.lastName}` : o.shipping?.name ?? '—'}</td>
                <td>{formatPrice(o.total)}</td>
                <td>
                  <span className={`${styles.badge} ${styles[o.status]}`}>
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </td>
                <td>
                  <Link to={`/admin/orders/${o._id}`} className={styles.viewLink}>
                    צפה
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, linkTo, highlight }) {
  const card = (
    <div className={`${styles.statCard} ${highlight ? styles.highlight : ''}`}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
  return linkTo ? <Link to={linkTo} className={styles.statLink}>{card}</Link> : card;
}
