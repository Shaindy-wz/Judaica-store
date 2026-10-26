import { useState, useRef } from 'react';
import { importProducts } from '../../services/adminService';
import { readProductSheet, downloadTemplate } from '../../utils/productSheet';
import { formatPrice } from '../../utils/formatPrice';
import styles from './ProductImportPanel.module.css';

// Bulk import: pick a file → the server checks every row (nothing saved) →
// the admin reviews the preview and errors → confirm saves all of it at once.
export default function ProductImportPanel({ onClose, onImported }) {
  const [stage, setStage] = useState('pick'); // pick | checking | review | saving | done
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState([]);
  const [sheet, setSheet] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    setError('');
    setResult(null);
    setFileName(file.name);
    setStage('checking');
    try {
      const read = await readProductSheet(file);
      setRows(read.rows);
      setSheet(read);
      setResult(await importProducts(read.rows, true));
      setStage('review');
    } catch (e) {
      setError(e.message || 'קריאת הקובץ נכשלה');
      setStage('pick');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleConfirm() {
    setError('');
    setStage('saving');
    try {
      setResult(await importProducts(rows, false));
      setStage('done');
      onImported();
    } catch (e) {
      // A 400 carries the same shape as the preview, with the blocking errors.
      if (e.errors) setResult({ summary: e.summary, products: e.products ?? [], errors: e.errors, warnings: e.warnings ?? [] });
      setError(e.message || 'הייבוא נכשל');
      setStage('review');
    }
  }

  // Layout problems found while reading the file come first, then the server's checks.
  const errors = [...(sheet?.errors ?? []), ...(result?.errors ?? [])];
  const warnings = [...(sheet?.warnings ?? []), ...(result?.warnings ?? [])];
  const unknownHeaders = sheet?.unknownHeaders ?? [];
  const summary = result?.summary;

  return (
    <section className={styles.panel} aria-labelledby="import-title">
      <div className={styles.head}>
        <h2 id="import-title" className={styles.title}>ייבוא מוצרים מקובץ</h2>
        <button type="button" className={styles.close} onClick={onClose} aria-label="סגירת חלון הייבוא">✕</button>
      </div>

      {stage === 'done' ? (
        <div className={styles.success} role="status">
          <p>
            הייבוא הושלם: {summary.create} מוצרים חדשים נוספו ו-{summary.update} מוצרים עודכנו.
          </p>
          <button type="button" className={styles.primary} onClick={onClose}>סגירה</button>
        </div>
      ) : (
        <>
          <details className={styles.help}>
            <summary>איך ממלאים את הקובץ?</summary>
            <ul>
              <li>מתחילים מ<button type="button" className={styles.link} onClick={downloadTemplate}>קובץ התבנית</button>, או מקובץ "ייצוא לקובץ" של המוצרים הקיימים. מוצרים ששמם מתחיל ב"דוגמה" לא ייובאו.</li>
              <li>גיליון "מלאי ומוצרים": שורה לכל מוצר — שם, קטגוריה, מחיר לצרכן, ומחיר מבצע אם יש. מחיר מבצע ריק מבטל מבצע קיים.</li>
              <li>גיליון "מוצרים": שורה לכל צבע/מידה של מוצר, עם אותו שם מוצר, ומק"ט ומחיר משלה. מחיר ריק = המחיר מהגיליון "מלאי ומוצרים". מוצר בלי צבעים ומידות לא צריך שורה כאן.</li>
              <li>אפשרויות בתשלום (למשל "רקמת שם"): בעמודה "אפשרויות", והמחיר הנוסף בעמודה "מחיר תוספת". כמה אפשרויות — מפרידים בפסיק, באותו סדר בשתי העמודות. באתר הלקוח יבחר כן/לא והמחיר יתעדכן.</li>
              <li>קטגוריה: השם כפי שמופיע בעמוד הקטגוריות. לתת-קטגוריה אפשר לכתוב "טליתות &gt; ילדים".</li>
              <li>מוצר שכבר קיים באתר (לפי השם, או לפי המק"ט) יעודכן. תא ריק לא משנה את מה שכבר שמור, והמלאי של כל צבע/מידה נשמר.</li>
              <li>תמונות ותיאור מוסיפים בעריכת המוצר באתר.</li>
            </ul>
          </details>

          <div className={styles.pickRow}>
            <label className={styles.primary}>
              {stage === 'pick' ? 'בחירת קובץ' : 'בחירת קובץ אחר'}
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className={styles.hiddenInput}
                onChange={(e) => handleFile(e.target.files[0])}
                disabled={stage === 'checking' || stage === 'saving'}
              />
            </label>
            {fileName && <span className={styles.fileName}>{fileName}</span>}
          </div>

          {stage === 'checking' && <p className={styles.status} role="status">בודק את הקובץ...</p>}
          {error && <p className={styles.error} role="alert">{error}</p>}

          {summary && (stage === 'review' || stage === 'saving') && (
            <div className={styles.review}>
              <p className={styles.summary}>
                בקובץ: <strong>{summary.create}</strong> מוצרים חדשים, <strong>{summary.update}</strong> מוצרים לעדכון
                {errors.length > 0 && <>, <strong className={styles.errorCount}>{errors.length} שגיאות</strong></>}
              </p>

              {unknownHeaders.length > 0 && (
                <p className={styles.warning}>
                  העמודות האלה לא מוכרות ולא ייובאו: {unknownHeaders.join(', ')}
                </p>
              )}

              {errors.length > 0 && (
                <div className={styles.errorBox}>
                  <p>יש לתקן את השגיאות בקובץ ולבחור אותו שוב. כל עוד יש שגיאות, לא יישמר דבר.</p>
                  <table className={styles.table}>
                    <thead><tr><th scope="col">איפה</th><th scope="col">מה לתקן</th></tr></thead>
                    <tbody>
                      {errors.map((e, i) => (
                        <tr key={i}><td>{e.label ?? `שורה ${e.row}`}</td><td>{e.message}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {warnings.length > 0 && (
                <ul className={styles.warningList}>
                  {warnings.map((w, i) => <li key={i}>{w.label ?? `שורה ${w.row}`}: {w.message}</li>)}
                </ul>
              )}

              {result.products?.length > 0 && (
                <details className={styles.preview} open={errors.length === 0}>
                  <summary>רשימת המוצרים בקובץ ({result.products.length})</summary>
                  <table className={styles.table}>
                    <thead>
                      <tr><th scope="col">מוצר</th><th scope="col">פעולה</th><th scope="col">אפשרויות</th><th scope="col">מחיר</th></tr>
                    </thead>
                    <tbody>
                      {result.products.map((p) => (
                        <tr key={p.name}>
                          <td>{p.name}</td>
                          <td>{p.action === 'create' ? 'חדש' : 'עדכון'}</td>
                          <td>{p.variants || '—'}</td>
                          <td>{p.price != null ? `${p.variants ? 'החל מ-' : ''}${formatPrice(p.price)}` : 'ללא שינוי'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              )}

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={handleConfirm}
                  disabled={errors.length > 0 || stage === 'saving' || !result.products?.length}
                >
                  {stage === 'saving' ? 'מייבא...' : 'אישור וייבוא'}
                </button>
                <button type="button" className={styles.secondary} onClick={onClose}>ביטול</button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
