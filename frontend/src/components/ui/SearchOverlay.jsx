import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSearch } from '../../context/SearchContext';
import styles from './SearchOverlay.module.css';

export default function SearchOverlay() {
  const { query, setQuery, results, isOpen, setIsOpen } = useSearch();
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  function close() {
    setIsOpen(false);
    setQuery('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    close();
  }

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={close} role="dialog" aria-modal="true" aria-label="חיפוש מוצרים">
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <form className={styles.form} onSubmit={handleSubmit} role="search">
          <label htmlFor="search-overlay-input" className={styles.srOnly}>חיפוש מוצרים</label>
          <input
            id="search-overlay-input"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפש מוצרים באתר…"
            className={styles.input}
          />
          <button type="submit" className={styles.iconBtn} aria-label="חפש">
            🔍
          </button>
          <button type="button" className={styles.iconBtn} onClick={close} aria-label="סגור חיפוש">
            ✕
          </button>
        </form>

        <p className={styles.hint}>ניתן לחפש עם או בלי ניקוד/דגש — החיפוש מוצא שתי הצורות</p>

        {query.length >= 2 && results.length === 0 && (
          <p className={styles.empty}>לא נמצאו תוצאות עבור &quot;{query}&quot;</p>
        )}

        {results.length > 0 && (
          <ul className={styles.results} role="listbox" aria-label="תוצאות חיפוש">
            {results.map((product) => {
              const price = product.priceRange?.min ?? product.basePrice;
              return (
                <li key={product._id} role="option">
                  <Link to={`/product/${product.slug}`} className={styles.result} onClick={close}>
                    <img
                      src={product.images?.[0] || '/assets/images/placeholder.jpg'}
                      alt={product.name}
                      className={styles.resultImage}
                    />
                    <div className={styles.resultInfo}>
                      <span className={styles.resultName}>{product.name}</span>
                      <span className={styles.resultPrice}>₪{price}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
