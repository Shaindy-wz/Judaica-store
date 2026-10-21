import styles from './PageLoader.module.css';

// Shown while a lazily loaded page's code is downloading.
export default function PageLoader() {
  return (
    <div className={styles.loader} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>טוען...</span>
    </div>
  );
}
