import { useState, useEffect } from 'react';
import {
  getAdminCoupons,
  generateCouponCode,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';
import AdminTable from '../components/AdminTable';
import styles from './AdminCouponsPage.module.css';

const MODE_LABELS = {
  shared: 'ציבורי',
  per_customer: 'אחד לאימייל',
  personal: 'אישי',
};

const MODE_DESCRIPTIONS = {
  shared: 'הרבה לקוחות יכולים להשתמש — מוגבל בכמות כוללת',
  per_customer: 'כולם יכולים להשתמש — כל אימייל פעם אחת בלבד',
  personal: 'מיועד ללקוח ספציפי — שימוש חד-פעמי',
};

const EMPTY = {
  code: '', type: 'percentage', value: '', minOrderAmount: '',
  couponMode: 'per_customer', forEmail: '', usageLimit: '', expiresAt: '', active: true,
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
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
      couponMode: c.couponMode ?? (c.onePerCustomer ? 'per_customer' : 'shared'),
      forEmail: c.forEmail ?? '',
      usageLimit: c.usageLimit ?? '',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
      active: c.active ?? true,
    });
    setFormError('');
    setModal({ mode: 'edit', id: c._id });
  }

  function closeModal() { setModal(null); }
  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const { code } = await generateCouponCode();
      set('code', code);
    } catch {
      setFormError('לא הצלחנו ליצור קוד');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    setFormError('');
    if (!form.code.trim() || !form.value) { setFormError('קוד וערך הנחה חובה'); return; }
    if (form.couponMode === 'personal' && !form.forEmail.trim()) {
      setFormError('יש להזין כתובת אימייל ללקוח האישי');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        couponMode: form.couponMode,
        forEmail: form.couponMode === 'personal' ? form.forEmail.trim().toLowerCase() : undefined,
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        usageLimit: form.couponMode !== 'personal' && form.usageLimit ? Number(form.usageLimit) : undefined,
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
      key: 'discount', label: 'הנחה',
      render: (row) => row.type === 'percentage' ? `${row.value}%` : formatPrice(row.value),
    },
    {
      key: 'couponMode', label: 'סוג קופון',
      render: (row) => {
        const mode = row.couponMode ?? (row.onePerCustomer ? 'per_customer' : 'shared');
        return <span className={styles[`mode_${mode}`]}>{MODE_LABELS[mode] ?? mode}</span>;
      },
    },
    {
      key: 'forEmail', label: 'אימייל אישי',
      render: (row) => row.forEmail ? <span className={styles.emailCell}>{row.forEmail}</span> : '—',
    },
    { key: 'usageLimit', label: 'מקס׳ שימושים', render: (row) => row.usageLimit ?? '∞' },
    { key: 'usedCount', label: 'שומשו', render: (row) => row.usedCount ?? 0 },
    { key: 'minOrderAmount', label: 'מינ׳ הזמנה', render: (row) => row.minOrderAmount ? formatPrice(row.minOrderAmount) : '—' },
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

            {/* Coupon code */}
            <label className={styles.label}>קוד קופון *</label>
            <div className={styles.codeRow}>
              <input
                value={form.code}
                onChange={(e) => set('code', e.target.value.toUpperCase())}
                className={styles.input}
                dir="ltr"
                placeholder="SAVE20"
              />
              <button type="button" className={styles.generateBtn} onClick={handleGenerate} disabled={generating}>
                {generating ? '...' : '🎲 יצור קוד'}
              </button>
            </div>

            {/* Discount type + value */}
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
                <input
                  type="number" min="0"
                  value={form.value}
                  onChange={(e) => set('value', e.target.value)}
                  className={styles.input}
                  placeholder={form.type === 'percentage' ? '20' : '50'}
                />
              </div>
            </div>

            {/* Coupon mode */}
            <label className={styles.label}>סוג קופון</label>
            <div className={styles.modeGroup}>
              {['shared', 'per_customer', 'personal'].map((m) => (
                <label
                  key={m}
                  className={`${styles.modeOption} ${form.couponMode === m ? styles.modeOptionSelected : ''}`}
                >
                  <input
                    type="radio"
                    name="couponMode"
                    value={m}
                    checked={form.couponMode === m}
                    onChange={() => set('couponMode', m)}
                  />
                  <span className={styles.modeLabel}>{MODE_LABELS[m]}</span>
                  <span className={styles.modeDesc}>{MODE_DESCRIPTIONS[m]}</span>
                </label>
              ))}
            </div>

            {/* Personal email — shown only for personal mode */}
            {form.couponMode === 'personal' && (
              <>
                <label className={styles.label}>אימייל הלקוח *</label>
                <input
                  type="email"
                  value={form.forEmail}
                  onChange={(e) => set('forEmail', e.target.value)}
                  className={styles.input}
                  dir="ltr"
                  placeholder="customer@example.com"
                />
              </>
            )}

            {/* Usage limit — hidden for personal (auto = 1) */}
            <div className={styles.row}>
              <div>
                <label className={styles.label}>מינימום הזמנה (₪)</label>
                <input
                  type="number" min="0"
                  value={form.minOrderAmount}
                  onChange={(e) => set('minOrderAmount', e.target.value)}
                  className={styles.input}
                />
              </div>
              {form.couponMode !== 'personal' && (
                <div>
                  <label className={styles.label}>
                    {form.couponMode === 'shared' ? 'כמות שימושים מקסימלית' : 'מקס׳ שימושים כולל (אופציונלי)'}
                  </label>
                  <input
                    type="number" min="1"
                    value={form.usageLimit}
                    onChange={(e) => set('usageLimit', e.target.value)}
                    className={styles.input}
                    placeholder={form.couponMode === 'shared' ? 'לדוגמה: 100' : 'ריק = ללא הגבלה'}
                  />
                </div>
              )}
              {form.couponMode === 'personal' && (
                <div>
                  <label className={styles.label}>כמות שימושים</label>
                  <input value="1 (אוטומטי)" disabled className={`${styles.input} ${styles.inputDisabled}`} />
                </div>
              )}
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
