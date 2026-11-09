import { useState, useRef, useEffect } from 'react';
import { uploadImages } from '../../services/adminService';
import styles from './ImageUploader.module.css';

// onChange receives either the new list or an updater function (prev => next),
// so photos added while an earlier batch is still uploading are never lost.
// onUploadingChange(true/false) lets the form hold "save" until uploads finish.
export default function ImageUploader({ images = [], onChange, onUploadingChange }) {
  const [pending, setPending] = useState(0);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef();
  const uploading = pending > 0;

  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [uploading, onUploadingChange]);

  async function handleFiles(fileList) {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;
    setError('');
    setPending((n) => n + 1);
    setProgress(files.length > 1 ? `מעלה 0 מתוך ${files.length}...` : 'מעלה...');
    try {
      const results = await uploadImages(files, (done, total) => {
        if (total > 1) setProgress(`מעלה ${done} מתוך ${total}...`);
      });
      // One bad file must not discard the ones that did upload.
      const urls = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
      const failures = results.filter((r) => r.status === 'rejected');
      if (urls.length) onChange((prev) => [...prev, ...urls]);
      if (failures.length) {
        setError(failures.map((r) => r.reason?.message || 'שגיאה בהעלאת תמונה').join(' | '));
      }
    } finally {
      setPending((n) => n - 1);
      if (inputRef.current) inputRef.current.value = ''; // allow re-picking the same file
    }
  }

  // A screenshot or copied picture can be pasted straight in (Ctrl+V).
  function handlePaste(e) {
    const files = Array.from(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith('image/'));
    if (files.length) {
      e.preventDefault();
      handleFiles(files);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function removeImage(index) {
    onChange(images.filter((_, i) => i !== index));
  }

  function moveLeft(index) {
    if (index === 0) return;
    const next = [...images];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  function moveRight(index) {
    if (index === images.length - 1) return;
    const next = [...images];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  }

  return (
    <div className={styles.uploader}>
      <div
        className={styles.dropzone}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onPaste={handlePaste}
        onClick={() => inputRef.current.click()}
        role="button"
        aria-label="גרור תמונות לכאן, הדבק תמונה או לחץ להעלאה"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current.click()}
      >
        {uploading ? (
          <span role="status">{progress} אפשר להמשיך למלא את הטופס</span>
        ) : (
          <span>גרור תמונות לכאן, הדבק (Ctrl+V) או <strong>לחץ להעלאה</strong></span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          className={styles.hiddenInput}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}

      {images.length > 0 && (
        <div className={styles.previews}>
          {images.map((url, i) => (
            <div key={`${url}-${i}`} className={styles.preview}>
              {i === 0 && <span className={styles.mainBadge}>ראשי</span>}
              <img src={url} alt={`תמונה ${i + 1}`} className={styles.thumb} />
              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={() => moveRight(i)}
                  disabled={i === images.length - 1}
                  aria-label="הזז שמאלה"
                >←</button>
                <button
                  type="button"
                  onClick={() => moveLeft(i)}
                  disabled={i === 0}
                  aria-label="הזז ימינה"
                >→</button>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className={styles.removeBtn}
                  aria-label="הסר תמונה"
                >✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
