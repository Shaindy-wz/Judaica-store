import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../context/SearchContext';
import styles from './SearchBar.module.css';

export default function SearchBar() {
  const { query, setQuery } = useSearch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim().length < 2) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} role="search">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="חפש מוצרים באתר…"
        aria-label="חיפוש מוצרים"
        className={styles.input}
      />
      <button type="submit" className={styles.button} aria-label="חפש">
        🔍
      </button>
    </form>
  );
}
