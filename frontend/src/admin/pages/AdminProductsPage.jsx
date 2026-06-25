import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdminProducts, deleteProduct } from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';
import AdminTable from '../components/AdminTable';
import styles from './AdminProductsPage.module.css';

export default function AdminProductsPage() {
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    getAdminProducts({ page, limit: 20, q })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, q]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id, name) {
    if (!window.confirm(`למחוק את המוצר "${name}"?`)) return;
    try {
      await deleteProduct(id);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  const columns = [
    {
      key: 'image', label: 'תמונה', width: '60px',
      render: (row) => row.images?.[0]
        ? <img src={row.images[0]} alt={row.name} className={styles.thumb} />
        : <span className={styles.noImg}>—</span>,
    },
    { key: 'name', label: 'שם מוצר' },
    { key: 'category', label: 'קטגוריה', render: (row) => row.category?.name ?? '—' },
    { key: 'basePrice', label: 'מחיר', render: (row) => formatPrice(row.basePrice) },
    {
      key: 'inStock', label: 'מלאי',
      render: (row) => (
        <span className={row.inStock ? styles.inStock : styles.outStock}>
          {row.inStock ? 'במלאי' : 'אזל'}
        </span>
      ),
    },
    {
      key: 'actions', label: 'פעולות',
      render: (row) => (
        <div className={styles.actions}>
          <Link to={`/admin/products/${row._id}/edit`} className={styles.editBtn}>
            עריכה
          </Link>
          <button
            className={styles.deleteBtn}
            onClick={() => handleDelete(row._id, row.name)}
          >
            מחיקה
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>מוצרים</h1>
        <Link to="/admin/products/new" className={styles.addBtn}>
          + מוצר חדש
        </Link>
      </div>

      <div className={styles.filters}>
        <input
          type="search"
          placeholder="חיפוש לפי שם..."
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          className={styles.search}
          aria-label="חיפוש מוצרים"
        />
        <span className={styles.total}>{data.total} מוצרים</span>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p className={styles.loading}>טוען...</p>
      ) : (
        <AdminTable columns={columns} rows={data.items} emptyText="לא נמצאו מוצרים" />
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
