import styles from './StarRating.module.css';

export default function StarRating({ value = 0, count, size = 'md' }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`${styles.rating} ${styles[size]}`} aria-label={`${value} מתוך 5 כוכבים`}>
      <span className={styles.stars}>
        {stars.map((star) => (
          <span key={star} className={star <= Math.round(value) ? styles.filled : styles.empty}>
            ★
          </span>
        ))}
      </span>
      {count != null && <span className={styles.count}>({count})</span>}
    </div>
  );
}
