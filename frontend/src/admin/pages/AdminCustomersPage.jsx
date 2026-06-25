import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdminCustomers } from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';
import AdminTable from '../components/AdminTable';
import styles from './AdminCustomersPage.module.css';

export default function AdminCustomersPage() {
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    getAdminCustomers({ page, limit: 25, q })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, q]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    {
      key: 'name', label: 'שם',
      render: (row) => `${row.firstName} ${row.lastName}`,
    },
    { key: 'email', label: 'אימייל', render: (row) => <span className={styles.email}>{row.email}</span> },
    {
      key: 'phone', label: 'טלפון',
      render: (row) => row.phone ?? '—',
    },
    {
      key: 'joinedAt', label: 'נרשם',
      render: (row) => new Date(row.createdAt).toLocaleDateString('he-IL'),
    },
    {
      key: 'orderCount', label: 'הזמנות',
      render: (row) => row.orderCount ?? 0,
    },
    {
      key: 'totalSpend', label: 'סה״כ הוצאה',
      render: (row) => row.totalSpend ? formatPrice(row.totalSpend) : '—',
    },
    {
      key: 'actions', label: '', width: '100px',
      render: (row) => (
        <Link to={`/admin/customers/${row._id}`} className={styles.viewBtn}>
          הזמנות
        </Link>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>לקוחות</h1>
        <span className={styles.total}>{data.total} לקוחות</span>
      </div>

      <div className={styles.filters}>
        <input
          type="search"
          placeholder="חיפוש לפי שם / אימייל..."
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          className={styles.search}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p className={styles.loading}>טוען...</p>
      ) : (
        <AdminTable columns={columns} rows={data.items} emptyText="לא נמצאו לקוחות" />
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
