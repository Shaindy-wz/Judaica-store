import styles from './Pagination.module.css';

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  return (
    <nav className={styles.pagination} aria-label="ניווט בין עמודים">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        הקודם
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          className={p === page ? styles.active : undefined}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      <button disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
        הבא
      </button>
    </nav>
  );
}
