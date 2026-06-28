import styles from './InventoryStatus.module.css';

const LOW_STOCK_THRESHOLD = 5;

export default function InventoryStatus({ inStock, stockQuantity, requiresSelection }) {
  if (requiresSelection) {
    return <p className={styles.muted}>בחר אפשרויות לבדיקת מלאי</p>;
  }

  if (!inStock) {
    return <p className={styles.outOfStock}>אזל המלאי</p>;
  }

  if (stockQuantity != null && stockQuantity <= LOW_STOCK_THRESHOLD) {
    return <p className={styles.lowStock}>נשארו {stockQuantity} יחידות בלבד במלאי!</p>;
  }

  return <p className={styles.inStock}>במלאי</p>;
}
