import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSearch } from '../../context/SearchContext';
import { formatPrice } from '../../utils/formatPrice';
import styles from './SearchBar.module.css';

export default function SearchBar() {
  const { query, setQuery, results } = useSearch();
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  const trimmed = query.trim();
  const showDropdown = focused && trimmed.length > 0;

  const goToResults = () => {
    if (trimmed.length < 2) return;
    setFocused(false);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    goToResults();
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit} role="search">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={(e) => e.key === 'Escape' && setFocused(false)}
          placeholder="חפש מוצרים באתר…"
          aria-label="חיפוש מוצרים"
          className={styles.input}
        />
        <button type="submit" className={styles.button} aria-label="חפש">
          🔍
        </button>
      </form>

      {showDropdown && (
        <div className={styles.dropdown} role="listbox">
          {trimmed.length < 2 ? (
            <p className={styles.hint}>
              ניתן לחפש עם או בלי ניקוד/דגש — החיפוש מאתר את שתי הצורות
            </p>
          ) : results.length === 0 ? (
            <p className={styles.hint}>לא נמצאו תוצאות עבור &quot;{trimmed}&quot;</p>
          ) : (
            <>
              {results.slice(0, 6).map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product.slug}`}
                  className={styles.resultItem}
                  role="option"
                  aria-selected="false"
                  onMouseDown={() => setFocused(false)}
                >
                  <img src={product.images?.[0]} alt="" className={styles.resultImage} />
                  <div className={styles.resultInfo}>
                    <span className={styles.resultName}>{product.name}</span>
                    <span className={styles.resultPrice}>
                      {formatPrice(product.priceRange?.min ?? product.basePrice)}
                    </span>
                  </div>
                </Link>
              ))}
              <button type="button" className={styles.viewAll} onMouseDown={goToResults}>
                צפה בכל התוצאות
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
