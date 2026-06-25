import { useState, useEffect, useCallback } from 'react';
import { getAdminReviews, approveReview, rejectReview } from '../../services/adminService';
import AdminTable from '../components/AdminTable';
import styles from './AdminReviewsPage.module.css';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'ממתינות לאישור' },
  { value: 'approved', label: 'מאושרות' },
  { value: 'rejected', label: 'נדחו' },
];

const STARS = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

export default function AdminReviewsPage() {
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    getAdminReviews({ status: statusFilter, page, limit: 20 })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  async function handleApprove(id) {
    setActing(id);
    try { await approveReview(id); load(); }
    catch (e) { alert(e.message); }
    finally { setActing(''); }
  }

  async function handleReject(id) {
    if (!window.confirm('לדחות ביקורת זו?')) return;
    setActing(id);
    try { await rejectReview(id); load(); }
    catch (e) { alert(e.message); }
    finally { setActing(''); }
  }

  const columns = [
    {
      key: 'product', label: 'מוצר',
      render: (row) => row.product?.name ?? '—',
    },
    {
      key: 'user', label: 'לקוח',
      render: (row) => row.user ? `${row.user.firstName} ${row.user.lastName}` : '—',
    },
    {
      key: 'rating', label: 'דירוג',
      render: (row) => <span className={styles.stars}>{STARS(row.rating)}</span>,
    },
    {
      key: 'comment', label: 'תוכן',
      render: (row) => <span className={styles.comment}>{row.comment ?? '—'}</span>,
    },
    {
      key: 'date', label: 'תאריך',
      render: (row) => new Date(row.createdAt).toLocaleDateString('he-IL'),
    },
    {
      key: 'verified', label: 'קנייה מאומתת',
      render: (row) => (
        <span className={row.verifiedPurchase ? styles.verified : styles.unverified}>
          {row.verifiedPurchase ? 'כן' : 'לא'}
        </span>
      ),
    },
    {
      key: 'actions', label: 'פעולות', width: '160px',
      render: (row) => {
        const busy = acting === row._id;
        return (
          <div className={styles.actions}>
            {row.status !== 'approved' && (
              <button
                onClick={() => handleApprove(row._id)}
                disabled={busy}
                className={styles.approveBtn}
              >
                {busy ? '...' : 'אשר'}
              </button>
            )}
            {row.status !== 'rejected' && (
              <button
                onClick={() => handleReject(row._id)}
                disabled={busy}
                className={styles.rejectBtn}
              >
                {busy ? '...' : 'דחה'}
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>ביקורות</h1>

      <div className={styles.tabs}>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            className={`${styles.tab} ${statusFilter === s.value ? styles.active : ''}`}
            onClick={() => { setStatusFilter(s.value); setPage(1); }}
          >
            {s.label}
          </button>
        ))}
        <span className={styles.total}>{data.total} ביקורות</span>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p className={styles.loading}>טוען...</p>
      ) : (
        <AdminTable columns={columns} rows={data.items} emptyText="אין ביקורות" />
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
