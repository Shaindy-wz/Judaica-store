import { useState, useRef } from 'react';
import { uploadImageToCloudinary } from '../../services/adminService';
import styles from './ImageUploader.module.css';

export default function ImageUploader({ images = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef();

  async function handleFiles(files) {
    setError('');
    setUploading(true);
    try {
      const urls = await Promise.all(
        Array.from(files).map((f) => uploadImageToCloudinary(f))
      );
      onChange([...images, ...urls]);
    } catch (e) {
      setError(e.message || 'שגיאה בהעלאת תמונה');
    } finally {
      setUploading(false);
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
        onClick={() => inputRef.current.click()}
        role="button"
        aria-label="גרור תמונות לכאן או לחץ להעלאה"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current.click()}
      >
        {uploading ? (
          <span>מעלה...</span>
        ) : (
          <span>גרור תמונות לכאן או <strong>לחץ להעלאה</strong></span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className={styles.hiddenInput}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {images.length > 0 && (
        <div className={styles.previews}>
          {images.map((url, i) => (
            <div key={url} className={styles.preview}>
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
