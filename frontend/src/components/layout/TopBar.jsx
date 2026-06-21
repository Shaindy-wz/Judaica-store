import styles from './TopBar.module.css';

export default function TopBar() {
  return (
    <div className={styles.topbar}>
      <div className={styles.left}>
        <a href="/contact">צור קשר</a>
        <span>|</span>
        <a href="/branches">סניפים</a>
      </div>
      <div className={styles.right}>
        <a href="tel:1800707707">1-800-707-707</a>
      </div>
    </div>
  );
}
