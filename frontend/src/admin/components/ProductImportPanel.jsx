import { useState, useRef } from 'react';
import { importProducts, uploadImage } from '../../services/adminService';
import { readProductSheet, downloadTemplate, resolveProductImages } from '../../utils/productSheet';
import { formatPrice } from '../../utils/formatPrice';
import styles from './ProductImportPanel.module.css';

// Every spreadsheet format Excel, LibreOffice or Google Sheets saves. The list
// names both extensions and types, so the picker never greys out a valid file.
const ACCEPT = [
  '.xlsx', '.xls', '.xlsm', '.xlsb', '.ods', '.csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel', 'application/vnd.oasis.opendocument.spreadsheet', 'text/csv',
].join(',');

const productKey = (name) => String(name ?? '').trim().replace(/\s+/g, ' ').toLowerCase();

// Bulk import: pick a file → the server checks every row (nothing saved) →
// the admin reviews the preview and errors → confirm uploads the pictures and
// saves all of it at once.
export default function ProductImportPanel({ onClose, onImported }) {
  const [stage, setStage] = useState('pick'); // pick | checking | review | saving | done
  const [fileName, setFileName] = useState('');
  const [sheet, setSheet] = useState(null);
  const [localImages, setLocalImages] = useState([]);
  const [imageCheck, setImageCheck] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const imagesInputRef = useRef(null);

  async function check(read, images) {
    const resolved = await resolveProductImages(read, images);
    setImageCheck(resolved);
    setResult(await importProducts(resolved.rows, true));
  }

  async function handleFile(file) {
    if (!file) return;
    setError('');
    setResult(null);
    setFileName(file.name);
    setStage('checking');
    try {
      const read = await readProductSheet(file);
      setSheet(read);
      await check(read, localImages);
      setStage('review');
    } catch (e) {
      setSheet(null);
      setError(e.message || 'קריאת הקובץ נכשלה');
      setStage('pick');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleImages(fileList) {
    const picked = Array.from(fileList ?? []);
    if (imagesInputRef.current) imagesInputRef.current.value = '';
    if (!picked.length) return;
    const names = new Set(picked.map((f) => f.name.toLowerCase()));
    await applyImages([...localImages.filter((f) => !names.has(f.name.toLowerCase())), ...picked]);
  }

  const clearImages = () => applyImages([]);

  // Re-checks the file whenever the chosen pictures change.
  async function applyImages(images) {
    setLocalImages(images);
    if (!sheet) return;
    setError('');
    setStage('checking');
    try {
      await check(sheet, images);
    } catch (e) {
      setError(e.message || 'הבדיקה נכשלה');
    }
    setStage('review');
  }

  // A spreadsheet dropped on the panel is imported; pictures are added.
  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (stage === 'checking' || stage === 'saving') return;
    const files = Array.from(e.dataTransfer.files ?? []);
    const pictures = files.filter((f) => f.type.startsWith('image/') || /\.hei[cf]$/i.test(f.name));
    const spreadsheet = files.find((f) => !pictures.includes(f));
    if (pictures.length) handleImages(pictures);
    if (spreadsheet) handleFile(spreadsheet);
  }

  async function handleConfirm() {
    setError('');
    setStage('saving');
    try {
      const resolved = await resolveProductImages(sheet, localImages, uploadImage, (done, total) => {
        setProgress(total ? `מעלה תמונות: ${done} מתוך ${total}...` : '');
      });
      if (resolved.errors.length) {
        setImageCheck(resolved);
        setStage('review');
        return;
      }
      setProgress('שומר את המוצרים...');
      setResult(await importProducts(resolved.rows, false));
      setStage('done');
      onImported();
    } catch (e) {
      // A 400 carries the same shape as the preview, with the blocking errors.
      if (e.errors) setResult({ summary: e.summary, products: e.products ?? [], errors: e.errors, warnings: e.warnings ?? [] });
      setError(e.message || 'הייבוא נכשל');
      setStage('review');
    } finally {
      setProgress('');
    }
  }

  // Layout problems found while reading the file come first, then the server's checks.
  const errors = [...(sheet?.errors ?? []), ...(imageCheck?.errors ?? []), ...(result?.errors ?? [])];
  const warnings = [...(sheet?.warnings ?? []), ...(result?.warnings ?? [])];
  const unknownHeaders = sheet?.unknownHeaders ?? [];
  const summary = result?.summary;
  const imageCounts = imageCheck?.counts ?? new Map();
  const totalImages = [...imageCounts.values()].reduce((a, b) => a + b, 0);
  const busy = stage === 'checking' || stage === 'saving';

  return (
    <section
      className={`${styles.panel} ${dragging ? styles.dragging : ''}`}
      aria-labelledby="import-title"
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }}
      onDrop={handleDrop}
    >
      <div className={styles.head}>
        <h2 id="import-title" className={styles.title}>ייבוא מוצרים מקובץ</h2>
        <button type="button" className={styles.close} onClick={onClose} aria-label="סגירת חלון הייבוא">✕</button>
      </div>

      {stage === 'done' ? (
        <div className={styles.success} role="status">
          <p>
            הייבוא הושלם: {summary.create} מוצרים חדשים נוספו ו-{summary.update} מוצרים עודכנו
            {totalImages > 0 && <>, עם {totalImages} תמונות</>}.
          </p>
          <button type="button" className={styles.primary} onClick={onClose}>סגירה</button>
        </div>
      ) : (
        <>
          <details className={styles.help}>
            <summary>איך ממלאים את הקובץ?</summary>
            <ul>
              <li>מתחילים מ<button type="button" className={styles.link} onClick={downloadTemplate}>קובץ התבנית</button>, או מקובץ "ייצוא לקובץ" של המוצרים הקיימים. מוצרים ששמם מתחיל ב"דוגמה" לא ייובאו. כל קובץ Excel מתקבל (xlsx, xls ישן, CSV).</li>
              <li>גיליון "מלאי ומוצרים": שורה לכל מוצר — שם, קטגוריה, מחיר לצרכן, ומחיר מבצע אם יש. מחיר מבצע ריק מבטל מבצע קיים.</li>
              <li>גיליון "מוצרים": שורה לכל צבע/מידה של מוצר, עם אותו שם מוצר, ומק"ט ומחיר משלה. מחיר ריק = המחיר מהגיליון "מלאי ומוצרים". מוצר בלי צבעים ומידות לא צריך שורה כאן.</li>
              <li>אפשרויות בתשלום (למשל "רקמת שם"): בעמודה "אפשרויות", והמחיר הנוסף בעמודה "מחיר תוספת". כמה אפשרויות — מפרידים בפסיק, באותו סדר בשתי העמודות. באתר הלקוח יבחר כן/לא והמחיר יתעדכן.</li>
              <li>קטגוריה: השם כפי שמופיע בעמוד הקטגוריות. לתת-קטגוריה אפשר לכתוב "טליתות &gt; ילדים".</li>
              <li>
                <strong>תמונות — כל אחת מהדרכים עובדת:</strong> (1) להדביק את התמונה עצמה בתוך הקובץ, בשורה של המוצר (גם "הוספה בתוך תא");
                (2) בעמודה "תמונות" — קישור לתמונה; (3) בעמודה "תמונות" — שם קובץ התמונה (למשל talit1.jpg), ואז ללחוץ כאן על "הוספת תמונות מהמחשב" ולבחור את התמונות.
                כמה תמונות למוצר — מפרידים בפסיק. התמונה הראשונה היא התמונה הראשית.
              </li>
              <li>מוצר שכבר קיים באתר (לפי השם, או לפי המק"ט) יעודכן. תא ריק לא משנה את מה שכבר שמור, והמלאי של כל צבע/מידה נשמר. מוצר שיש לו תמונות בקובץ — התמונות שלו באתר יוחלפו בתמונות מהקובץ.</li>
            </ul>
          </details>

          <div className={styles.pickRow}>
            <label className={styles.primary}>
              {stage === 'pick' ? 'בחירת קובץ Excel' : 'בחירת קובץ אחר'}
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className={styles.hiddenInput}
                onChange={(e) => handleFile(e.target.files[0])}
                disabled={busy}
              />
            </label>
            <label className={styles.secondary}>
              הוספת תמונות מהמחשב
              <input
                ref={imagesInputRef}
                type="file"
                accept="image/*,.heic,.heif"
                multiple
                className={styles.hiddenInput}
                onChange={(e) => handleImages(e.target.files)}
                disabled={busy}
              />
            </label>
            {fileName && <span className={styles.fileName}>{fileName}</span>}
            {localImages.length > 0 && (
              <span className={styles.fileName}>
                {localImages.length} תמונות נבחרו
                {' '}
                <button type="button" className={styles.link} onClick={clearImages} disabled={busy}>
                  ניקוי
                </button>
              </span>
            )}
          </div>
          {stage === 'pick' && <p className={styles.status}>אפשר גם לגרור לכאן את קובץ האקסל ואת התמונות.</p>}

          {stage === 'checking' && <p className={styles.status} role="status">בודק את הקובץ...</p>}
          {stage === 'saving' && progress && <p className={styles.status} role="status">{progress}</p>}
          {error && <p className={styles.error} role="alert">{error}</p>}

          {summary && (stage === 'review' || stage === 'saving') && (
            <div className={styles.review}>
              <p className={styles.summary}>
                בקובץ: <strong>{summary.create}</strong> מוצרים חדשים, <strong>{summary.update}</strong> מוצרים לעדכון
                {totalImages > 0 && <>, <strong>{totalImages}</strong> תמונות</>}
                {errors.length > 0 && <>, <strong className={styles.errorCount}>{errors.length} שגיאות</strong></>}
              </p>

              {unknownHeaders.length > 0 && (
                <p className={styles.warning}>
                  העמודות האלה לא מוכרות ולא ייובאו: {unknownHeaders.join(', ')}
                </p>
              )}

              {errors.length > 0 && (
                <div className={styles.errorBox}>
                  <p>יש לתקן את השגיאות ולבחור את הקובץ שוב. כל עוד יש שגיאות, לא יישמר דבר.</p>
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
                      <tr>
                        <th scope="col">מוצר</th><th scope="col">פעולה</th><th scope="col">אפשרויות</th>
                        <th scope="col">מחיר</th><th scope="col">תמונות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.products.map((p) => (
                        <tr key={p.name}>
                          <td>{p.name}</td>
                          <td>{p.action === 'create' ? 'חדש' : 'עדכון'}</td>
                          <td>{p.variants || '—'}</td>
                          <td>{p.price != null ? `${p.variants ? 'החל מ-' : ''}${formatPrice(p.price)}` : 'ללא שינוי'}</td>
                          <td>{imageCounts.get(productKey(p.name)) || '—'}</td>
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
                  disabled={errors.length > 0 || busy || !result.products?.length}
                >
                  {stage === 'saving' ? 'מייבא...' : 'אישור וייבוא'}
                </button>
                <button type="button" className={styles.secondary} onClick={onClose} disabled={stage === 'saving'}>ביטול</button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
