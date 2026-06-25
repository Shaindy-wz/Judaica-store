import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdminOrders } from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';
import AdminTable from '../components/AdminTable';
import styles from './AdminOrdersPage.module.css';

const STATUS_OPTIONS = [
  { value: '', label: 'כל הסטטוסים' },
  { value: 'pending', label: 'ממתין' },
  { value: 'paid', label: 'שולם' },
  { value: 'shipped', label: 'נשלח' },
  { value: 'delivered', label: 'נמסר' },
  { value: 'cancelled', label: 'בוטל' },
];

const STATUS_LABELS = {
  pending: 'ממתין', paid: 'שולם', shipped: 'נשלח', delivered: 'נמסר', cancelled: 'בוטל',
};

export default function AdminOrdersPage() {
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    getAdminOrders({ page, limit: 25, status, q })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, status, q]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    {
      key: 'id', label: 'מס׳ הזמנה', width: '120px',
      render: (row) => (
        <span className={styles.mono}>{row._id.slice(-8).toUpperCase()}</span>
      ),
    },
    {
      key: 'customer', label: 'לקוח',
      render: (row) => row.user
        ? `${row.user.firstName} ${row.user.lastName}`
        : row.shipping?.name ?? '—',
    },
    {
      key: 'date', label: 'תאריך',
      render: (row) => new Date(row.createdAt).toLocaleDateString('he-IL'),
    },
    { key: 'total', label: 'סה״כ', render: (row) => formatPrice(row.total) },
    {
      key: 'status', label: 'סטטוס',
      render: (row) => (
        <span className={`${styles.badge} ${styles[row.status]}`}>
          {STATUS_LABELS[row.status] ?? row.status}
        </span>
      ),
    },
    {
      key: 'actions', label: '', width: '80px',
      render: (row) => (
        <Link to={`/admin/orders/${row._id}`} className={styles.viewBtn}>
          פרטים
        </Link>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>הזמנות</h1>

      <div className={styles.filters}>
        <input
          type="search" placeholder="חיפוש לפי שם / מזהה..."
          value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }}
          className={styles.search}
        />
        <div className={styles.statusTabs}>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              className={`${styles.tab} ${status === s.value ? styles.active : ''}`}
              onClick={() => { setStatus(s.value); setPage(1); }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <span className={styles.total}>{data.total} הזמנות</span>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p className={styles.loading}>טוען...</p>
      ) : (
        <AdminTable columns={columns} rows={data.items} emptyText="לא נמצאו הזמנות" />
      )}

      {data.pages > 1 && (
        <div className={styles.pagination}>
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹ הקודם</button>
          <span>{page} / {data.pages}</span>
          <button disabled={page === data.pages} onClick={() => setPage((p) => p + 1)}>הבא ›</button>
        </div>
      )}
    </div>
  );
}
