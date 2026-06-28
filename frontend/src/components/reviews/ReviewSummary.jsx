import StarRating from '../ui/StarRating';
import styles from './ReviewSummary.module.css';

export default function ReviewSummary({ reviews }) {
  const count = reviews.length;
  const average = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    starCount: reviews.filter((r) => r.rating === stars).length,
  }));

  return (
    <div className={styles.summary}>
      <div className={styles.headline}>
        <span className={styles.average}>{average.toFixed(1)}</span>
        <StarRating value={average} count={count} />
      </div>
      {count > 0 && (
        <ul className={styles.breakdown}>
          {breakdown.map(({ stars, starCount }) => (
            <li key={stars} className={styles.row}>
              <span>{stars} ★</span>
              <span className={styles.bar}>
                <span
                  className={styles.fill}
                  style={{ width: `${count ? (starCount / count) * 100 : 0}%` }}
                />
              </span>
              <span>{starCount}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
