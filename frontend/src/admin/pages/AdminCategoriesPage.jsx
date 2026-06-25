import { useState, useEffect } from 'react';
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/adminService';
import styles from './AdminCategoriesPage.module.css';

const EMPTY = { name: '', slug: '', parent: '' };

export default function AdminCategoriesPage() {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit', data, parentId? }
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  function load() {
    setLoading(true);
    getAdminCategories()
      .then(setTree)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openAdd(parentId = '') {
    setForm({ ...EMPTY, parent: parentId });
    setFormError('');
    setModal({ mode: 'add' });
  }

  function openEdit(cat) {
    setForm({ name: cat.name, slug: cat.slug ?? '', parent: cat.parent ?? '' });
    setFormError('');
    setModal({ mode: 'edit', id: cat._id });
  }

  function closeModal() { setModal(null); }

  async function handleSave() {
    setFormError('');
    if (!form.name.trim()) { setFormError('שם הקטגוריה חובה'); return; }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), slug: form.slug.trim() || undefined, parent: form.parent || undefined };
      if (modal.mode === 'add') {
        await createCategory(payload);
      } else {
        await updateCategory(modal.id, payload);
      }
      closeModal();
      load();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cat) {
    if (!window.confirm(`למחוק את הקטגוריה "${cat.name}"?`)) return;
    try {
      await deleteCategory(cat._id);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>קטגוריות</h1>
        <button onClick={() => openAdd()} className={styles.addBtn}>+ קטגוריה ראשית</button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p className={styles.loading}>טוען...</p>
      ) : (
        <div className={styles.tree}>
          {tree.length === 0 && <p className={styles.empty}>אין קטגוריות</p>}
          {tree.map((cat) => (
            <CategoryNode
              key={cat._id}
              cat={cat}
              depth={0}
              onAdd={openAdd}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {modal.mode === 'add' ? 'קטגוריה חדשה' : 'עריכת קטגוריה'}
            </h2>
            {formError && <p className={styles.formError}>{formError}</p>}
            <label className={styles.label}>שם *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={styles.input}
              autoFocus
            />
            <label className={styles.label}>Slug (URL)</label>
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className={styles.input}
              dir="ltr"
              placeholder="יווצר אוטומטית אם ריק"
            />
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

function CategoryNode({ cat, depth, onAdd, onEdit, onDelete }) {
  return (
    <div className={styles.node} style={{ marginRight: `${depth * 24}px` }}>
      <div className={styles.nodeRow}>
        <span className={styles.nodeName}>{cat.name}</span>
        <div className={styles.nodeActions}>
          <button onClick={() => onAdd(cat._id)} className={`${styles.nodeBtn} ${styles.addSubBtn}`}>+ תת-קטגוריה</button>
          <button onClick={() => onEdit(cat)} className={styles.nodeBtn}>עריכה</button>
          <button onClick={() => onDelete(cat)} className={`${styles.nodeBtn} ${styles.deleteBtn}`}>מחיקה</button>
        </div>
      </div>
      {cat.children?.map((child) => (
        <CategoryNode
          key={child._id}
          cat={child}
          depth={depth + 1}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
