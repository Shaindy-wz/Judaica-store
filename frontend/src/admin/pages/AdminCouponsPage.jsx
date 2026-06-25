import { useState, useEffect } from 'react';
import {
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';
import AdminTable from '../components/AdminTable';
import styles from './AdminCouponsPage.module.css';

const EMPTY = {
  code: '', type: 'percentage', value: '', minOrderAmount: '',
  maxUses: '', expiresAt: '', active: true,
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // null | { mode: 'add' | 'edit', id? }
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  function load() {
    setLoading(true);
    getAdminCoupons()
      .then(setCoupons)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openAdd() {
    setForm(EMPTY);
    setFormError('');
    setModal({ mode: 'add' });
  }

  function openEdit(c) {
    setForm({
      code: c.code,
      type: c.type,
      value: c.value ?? '',
      minOrderAmount: c.minOrderAmount ?? '',
      maxUses: c.maxUses ?? '',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
      active: c.active ?? true,
    });
    setFormError('');
    setModal({ mode: 'edit', id: c._id });
  }

  function closeModal() { setModal(null); }

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  async function handleSave() {
    setFormError('');
    if (!form.code.trim() || !form.value) { setFormError('קוד וערך הנחה חובה'); return; }
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        expiresAt: form.expiresAt || undefined,
        active: form.active,
      };
      if (modal.mode === 'add') {
        await createCoupon(payload);
      } else {
        await updateCoupon(modal.id, payload);
      }
      closeModal();
      load();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c) {
    if (!window.confirm(`למחוק קופון "${c.code}"?`)) return;
    try {
      await deleteCoupon(c._id);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  const columns = [
    { key: 'code', label: 'קוד', render: (row) => <span className={styles.code}>{row.code}</span> },
    {
      key: 'type', label: 'סוג',
      render: (row) => row.type === 'percentage' ? `${row.value}%` : formatPrice(row.value),
    },
    { key: 'minOrderAmount', label: 'מינ׳ הזמנה', render: (row) => row.minOrderAmount ? formatPrice(row.minOrderAmount) : '—' },
    { key: 'maxUses', label: 'שימושים מקס׳', render: (row) => row.maxUses ?? '∞' },
    { key: 'usedCount', label: 'שומשו', render: (row) => row.usedCount ?? 0 },
    { key: 'expiresAt', label: 'תפוגה', render: (row) => row.expiresAt ? new Date(row.expiresAt).toLocaleDateString('he-IL') : '—' },
    {
      key: 'active', label: 'פעיל',
      render: (row) => <span className={row.active ? styles.active : styles.inactive}>{row.active ? 'כן' : 'לא'}</span>,
    },
    {
      key: 'actions', label: '', width: '110px',
      render: (row) => (
        <div className={styles.actions}>
          <button onClick={() => openEdit(row)} className={styles.editBtn}>עריכה</button>
          <button onClick={() => handleDelete(row)} className={styles.deleteBtn}>מחיקה</button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>קופונים</h1>
        <button onClick={openAdd} className={styles.addBtn}>+ קופון חדש</button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p className={styles.loading}>טוען...</p>
      ) : (
        <AdminTable columns={columns} rows={coupons} emptyText="אין קופונים" />
      )}

      {modal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {modal.mode === 'add' ? 'קופון חדש' : 'עריכת קופון'}
            </h2>
            {formError && <p className={styles.formError}>{formError}</p>}

            <label className={styles.label}>קוד קופון *</label>
            <input value={form.code} onChange={(e) => set('code', e.target.value)} className={styles.input} dir="ltr" placeholder="SAVE20" />

            <div className={styles.row}>
              <div>
                <label className={styles.label}>סוג הנחה</label>
                <select value={form.type} onChange={(e) => set('type', e.target.value)} className={styles.input}>
                  <option value="percentage">אחוז (%)</option>
                  <option value="fixed">סכום קבוע (₪)</option>
                </select>
              </div>
              <div>
                <label className={styles.label}>ערך *</label>
                <input type="number" min="0" value={form.value} onChange={(e) => set('value', e.target.value)} className={styles.input} />
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label className={styles.label}>מינימום הזמנה (₪)</label>
                <input type="number" min="0" value={form.minOrderAmount} onChange={(e) => set('minOrderAmount', e.target.value)} className={styles.input} />
              </div>
              <div>
                <label className={styles.label}>מקסימום שימושים</label>
                <input type="number" min="0" value={form.maxUses} onChange={(e) => set('maxUses', e.target.value)} className={styles.input} />
              </div>
            </div>

            <label className={styles.label}>תאריך תפוגה</label>
            <input type="date" value={form.expiresAt} onChange={(e) => set('expiresAt', e.target.value)} className={styles.input} />

            <label className={styles.checkLabel}>
              <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} />
              {' '}קופון פעיל
            </label>

            <div className={styles.modalActions}>
              <button onClick={closeModal} className={styles.cancelBtn}>ביטול</button>
              <button onClick={handleSave} disabled={saving} className={styles.saveBtn}>
                {saving ? 'שומר...' : 'שמור'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
