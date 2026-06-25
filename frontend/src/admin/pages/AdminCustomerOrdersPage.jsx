import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCustomerOrders } from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';
import AdminTable from '../components/AdminTable';
import styles from './AdminCustomersPage.module.css';

const STATUS_LABELS = {
  pending: 'ממתין', paid: 'שולם', shipped: 'נשלח', delivered: 'נמסר', cancelled: 'בוטל',
};

export default function AdminCustomerOrdersPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getCustomerOrders(id)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const columns = [
    { key: 'id', label: 'הזמנה', render: (row) => <span className={styles.email}>{row._id.slice(-8).toUpperCase()}</span> },
    { key: 'date', label: 'תאריך', render: (row) => new Date(row.createdAt).toLocaleDateString('he-IL') },
    { key: 'total', label: 'סה״כ', render: (row) => formatPrice(row.total) },
    {
      key: 'status', label: 'סטטוס',
      render: (row) => STATUS_LABELS[row.status] ?? row.status,
    },
    {
      key: 'actions', label: '',
      render: (row) => <Link to={`/admin/orders/${row._id}`} className={styles.viewBtn}>פרטים</Link>,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/admin/customers" className={styles.email}>← חזרה ללקוחות</Link>
      </div>
      {data && (
        <h1 className={styles.title}>
          הזמנות: {data.customer.firstName} {data.customer.lastName}
        </h1>
      )}
      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p className={styles.loading}>טוען...</p>
      ) : data ? (
        <AdminTable columns={columns} rows={data.orders} emptyText="אין הזמנות" />
      ) : null}
    </div>
  );
}
