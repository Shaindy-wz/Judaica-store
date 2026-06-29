import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  getAdminCategories,
} from '../../services/adminService';
import ImageUploader from '../components/ImageUploader';
import styles from './AdminProductFormPage.module.css';

const EMPTY_FORM = {
  name: '', description: '', sku: '', basePrice: '', originalPrice: '',
  badge: '', category: '', subCategory: '', tags: '',
  images: [],
  options: [],
  variants: [],
  stockQuantity: '',
  specs: { material: '', kashrut: '', hashgacha: '', tradition: '', craftsmanship: '' },
  returnPolicy: { returnable: true, customizable: false, nonReturnableReason: '' },
  inStock: true, featured: false,
  seo: { metaTitle: '', metaDescription: '' },
};

function buildVariantMatrix(options) {
  if (!options.length) return [];
  const combine = (arr) =>
    arr.reduce((acc, { name, values }) =>
      acc.flatMap((combo) => values.map((v) => ({ ...combo, [name]: v }))),
      [{}]
    );
  return combine(options).map((combo) => ({
    optionValues: combo,
    price: '',
    sku: '',
    inStock: true,
    stockQuantity: '',
  }));
}

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [categoriesTree, setCategoriesTree] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const errorRef = useRef(null);

  useEffect(() => {
    getAdminCategories().then(setCategoriesTree);
  }, []);

  // When categories load in edit mode, detect which parent corresponds to form.category
  useEffect(() => {
    if (!categoriesTree.length || !form.category) return;
    if (categoriesTree.some((c) => c._id === form.category)) {
      setSelectedParentId(form.category);
      return;
    }
    for (const parent of categoriesTree) {
      if (parent.children?.some((c) => c._id === form.category)) {
        setSelectedParentId(parent._id);
        return;
      }
    }
  }, [categoriesTree]); // intentionally only on categoriesTree change

  // Load existing product for edit
  useEffect(() => {
    if (!isEdit) return;
    fetch(`/api/admin/products?limit=1000`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.json())
      .then(({ items }) => {
        const p = items.find((x) => x._id === id);
        if (!p) return;
        const { slug: _slug, ...rest } = p;
        setForm({
          ...EMPTY_FORM, ...rest,
          tags: (p.tags || []).join(', '),
          basePrice: p.basePrice ?? '',
          originalPrice: p.originalPrice ?? '',
          category: p.category?._id ?? p.category ?? '',
          specs: { ...EMPTY_FORM.specs, ...p.specs },
          returnPolicy: { ...EMPTY_FORM.returnPolicy, ...p.returnPolicy },
          seo: { ...EMPTY_FORM.seo, ...p.seo },
          options: p.options || [],
          variants: (p.variants || []).map((v) => ({
            ...v,
            optionValues: Object.fromEntries(v.optionValues instanceof Map
              ? v.optionValues.entries()
              : Object.entries(v.optionValues || {})),
          })),
        });
      });
  }, [isEdit, id]);

  function set(path, value) {
    setForm((prev) => {
      const next = { ...prev };
      const keys = path.split('.');
      let cursor = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cursor[keys[i]] = { ...cursor[keys[i]] };
        cursor = cursor[keys[i]];
      }
      cursor[keys[keys.length - 1]] = value;
      return next;
    });
  }

  function handleNameChange(e) {
    set('name', e.target.value);
  }

  function handleParentChange(parentId) {
    setSelectedParentId(parentId);
    set('category', parentId);
  }

  function handleSubCategoryChange(subId) {
    set('category', subId || selectedParentId);
  }

  // Options management
  function addOption() {
    const opts = [...form.options, { name: '', values: [] }];
    setForm((prev) => ({ ...prev, options: opts, variants: buildVariantMatrix(opts) }));
  }

  function updateOptionName(i, name) {
    const opts = form.options.map((o, idx) => idx === i ? { ...o, name } : o);
    setForm((prev) => ({ ...prev, options: opts, variants: buildVariantMatrix(opts) }));
  }

  function updateOptionValues(i, raw) {
    const values = raw.split(',').map((v) => v.trim()).filter(Boolean);
    const opts = form.options.map((o, idx) => idx === i ? { ...o, values } : o);
    setForm((prev) => ({ ...prev, options: opts, variants: buildVariantMatrix(opts) }));
  }

  function removeOption(i) {
    const opts = form.options.filter((_, idx) => idx !== i);
    setForm((prev) => ({ ...prev, options: opts, variants: buildVariantMatrix(opts) }));
  }

  function updateVariant(i, field, value) {
    const variants = form.variants.map((v, idx) =>
      idx === i ? { ...v, [field]: field === 'inStock' ? value : value } : v
    );
    setForm((prev) => ({ ...prev, variants }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        basePrice: Number(form.basePrice),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        stockQuantity: form.stockQuantity !== '' ? Number(form.stockQuantity) : undefined,
        variants: form.variants.map((v) => ({
          ...v,
          price: Number(v.price),
          stockQuantity: v.stockQuantity !== '' ? Number(v.stockQuantity) : undefined,
        })),
      };
      if (isEdit) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'שגיאה בשמירה');
      setTimeout(() => errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{isEdit ? 'עריכת מוצר' : 'מוצר חדש'}</h1>
      {error && <p className={styles.error} ref={errorRef}>{error}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>

        {/* Basic info */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>פרטים בסיסיים</h2>
          <Field label="שם מוצר *">
            <input value={form.name} onChange={handleNameChange} required />
          </Field>
          <Field label="תיאור">
            <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
          <div className={styles.row}>
            <Field label="קטגוריה ראשית">
              <select value={selectedParentId} onChange={(e) => handleParentChange(e.target.value)}>
                <option value="">— בחר קטגוריה —</option>
                {categoriesTree.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </Field>
            {selectedParentId && (() => {
              const parentCat = categoriesTree.find((c) => c._id === selectedParentId);
              if (!parentCat?.children?.length) {
                return (
                  <Field label="תת-קטגוריה">
                    <div className={styles.noSubCats}>
                      <span>אין תת-קטגוריות לקטגוריה זו עדיין.</span>
                      <a href="/admin/categories" className={styles.createSubLink}>
                        צור תת-קטגוריות ←
                      </a>
                    </div>
                  </Field>
                );
              }
              const isSubSelected = parentCat.children.some((c) => c._id === form.category);
              return (
                <Field label="תת-קטגוריה">
                  <select value={isSubSelected ? form.category : ''} onChange={(e) => handleSubCategoryChange(e.target.value)}>
                    <option value="">— ללא תת-קטגוריה —</option>
                    {parentCat.children.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </Field>
              );
            })()}
            <Field label="Badge">
              <select value={form.badge} onChange={(e) => set('badge', e.target.value)}>
                <option value="">ללא</option>
                <option value="חדש">חדש</option>
                <option value="מבצע">מבצע</option>
                <option value="פופולרי">פופולרי</option>
              </select>
            </Field>
          </div>
          <Field label="תגיות (מופרדות בפסיקים)">
            <input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="למשל: שבת, מהדרין" />
          </Field>
        </section>

        {/* Pricing */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>מחיר</h2>
          <div className={styles.row}>
            <Field label="מחיר בסיס (₪) *">
              <input type="number" min="0" step="0.01" value={form.basePrice}
                onChange={(e) => set('basePrice', e.target.value)} required />
            </Field>
            <Field label="מחיר מקורי לפני הנחה (₪)">
              <input type="number" min="0" step="0.01" value={form.originalPrice}
                onChange={(e) => set('originalPrice', e.target.value)} />
            </Field>
            <Field label="מק״ט">
              <input value={form.sku} onChange={(e) => set('sku', e.target.value)} dir="ltr" />
            </Field>
            {form.variants.length === 0 && (
              <Field label="כמות במלאי (ריק = ללא מעקב)">
                <input
                  type="number" min="0"
                  value={form.stockQuantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      stockQuantity: val,
                      inStock: val !== '' ? Number(val) > 0 : prev.inStock,
                    }));
                  }}
                  placeholder="למשל: 50"
                />
              </Field>
            )}
          </div>
        </section>

        {/* Variants */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>אפשרויות וגרסאות</h2>
          <p className={styles.hint}>הוסף ממדי אפשרויות (צבע, מידה, גימור). הגרסאות ייווצרו אוטומטית.</p>

          {form.options.map((opt, i) => (
            <div key={i} className={styles.optionRow}>
              <Field label={`שם ממד ${i + 1}`}>
                <input value={opt.name} onChange={(e) => updateOptionName(i, e.target.value)}
                  placeholder="למשל: צבע" />
              </Field>
              <Field label="ערכים (מופרדים בפסיקים)">
                <input value={opt.values.join(', ')} onChange={(e) => updateOptionValues(i, e.target.value)}
                  placeholder="לבן, שחור, כחול" />
              </Field>
              <button type="button" onClick={() => removeOption(i)} className={styles.removeBtn}>
                הסר
              </button>
            </div>
          ))}
          <button type="button" onClick={addOption} className={styles.addOptionBtn}>
            + הוסף ממד
          </button>

          {form.variants.length > 0 && (
            <div className={styles.variantsTable}>
              <h3 className={styles.variantsTitle}>גרסאות ({form.variants.length})</h3>
              <table>
                <thead>
                  <tr>
                    {form.options.map((o) => <th key={o.name}>{o.name}</th>)}
                    <th>מחיר (₪) *</th>
                    <th>מק״ט</th>
                    <th>מלאי</th>
                    <th>כמות</th>
                  </tr>
                </thead>
                <tbody>
                  {form.variants.map((v, i) => (
                    <tr key={i}>
                      {form.options.map((o) => (
                        <td key={o.name}>{v.optionValues[o.name] ?? '—'}</td>
                      ))}
                      <td>
                        <input type="number" min="0" step="0.01" value={v.price}
                          onChange={(e) => updateVariant(i, 'price', e.target.value)}
                          className={styles.variantInput} />
                      </td>
                      <td>
                        <input value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                          className={styles.variantInput} dir="ltr" />
                      </td>
                      <td>
                        <input type="checkbox" checked={v.inStock}
                          onChange={(e) => updateVariant(i, 'inStock', e.target.checked)} />
                      </td>
                      <td>
                        <input type="number" min="0" value={v.stockQuantity}
                          onChange={(e) => updateVariant(i, 'stockQuantity', e.target.value)}
                          className={styles.variantInput} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Images */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>תמונות</h2>
          <ImageUploader images={form.images} onChange={(imgs) => set('images', imgs)} />
        </section>

        {/* Specs */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>מפרט טכני</h2>
          <div className={styles.row}>
            <Field label="חומר"><input value={form.specs.material} onChange={(e) => set('specs.material', e.target.value)} /></Field>
            <Field label="כשרות"><input value={form.specs.kashrut} onChange={(e) => set('specs.kashrut', e.target.value)} /></Field>
            <Field label="הכשר (שם הרב/גוף)"><input value={form.specs.hashgacha} onChange={(e) => set('specs.hashgacha', e.target.value)} /></Field>
          </div>
          <div className={styles.row}>
            <Field label="עדה/מסורת"><input value={form.specs.tradition} onChange={(e) => set('specs.tradition', e.target.value)} /></Field>
            <Field label="אומנות"><input value={form.specs.craftsmanship} onChange={(e) => set('specs.craftsmanship', e.target.value)} /></Field>
          </div>
        </section>

        {/* Return policy */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>מדיניות החזרה</h2>
          <div className={styles.toggleRow}>
            <label>
              <input type="checkbox" checked={form.returnPolicy.returnable}
                onChange={(e) => set('returnPolicy.returnable', e.target.checked)} />
              {' '}ניתן להחזיר
            </label>
            <label>
              <input type="checkbox" checked={form.returnPolicy.customizable}
                onChange={(e) => set('returnPolicy.customizable', e.target.checked)} />
              {' '}מוצר מותאם אישית
            </label>
          </div>
          {(!form.returnPolicy.returnable || form.returnPolicy.customizable) && (
            <Field label="סיבת אי-החזרה">
              <input value={form.returnPolicy.nonReturnableReason}
                onChange={(e) => set('returnPolicy.nonReturnableReason', e.target.value)}
                placeholder="למשל: חפץ קדושה — אינו ניתן להחזרה" />
            </Field>
          )}
        </section>

        {/* SEO */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>SEO</h2>
          <Field label={`כותרת Meta (${form.seo.metaTitle.length}/60)`}>
            <input maxLength={60} value={form.seo.metaTitle}
              onChange={(e) => set('seo.metaTitle', e.target.value)} />
          </Field>
          <Field label={`תיאור Meta (${form.seo.metaDescription.length}/160)`}>
            <textarea rows={3} maxLength={160} value={form.seo.metaDescription}
              onChange={(e) => set('seo.metaDescription', e.target.value)} />
          </Field>
        </section>

        {/* Toggles */}
        <section className={styles.section}>
          <div className={styles.toggleRow}>
            <label title={form.stockQuantity !== '' ? 'מחושב אוטומטית לפי כמות במלאי' : ''}>
              <input
                type="checkbox"
                checked={form.inStock}
                disabled={form.stockQuantity !== ''}
                onChange={(e) => set('inStock', e.target.checked)}
              />
              {' '}במלאי
              {form.stockQuantity !== '' && (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginRight: '6px' }}>
                  (אוטומטי לפי כמות)
                </span>
              )}
            </label>
            <label>
              <input type="checkbox" checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)} />
              {' '}מוצר מומלץ
            </label>
          </div>
        </section>

        <div className={styles.formActions}>
          <button type="button" onClick={() => navigate('/admin/products')} className={styles.cancelBtn}>
            ביטול
          </button>
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? 'שומר...' : isEdit ? 'שמור שינויים' : 'צור מוצר'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

