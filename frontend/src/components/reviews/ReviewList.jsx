import StarRating from '../ui/StarRating';
import styles from './ReviewList.module.css';

export default function ReviewList({ reviews }) {
  if (!reviews.length) {
    return <p className={styles.empty}>אין עדיין ביקורות למוצר זה.</p>;
  }

  return (
    <ul className={styles.list}>
      {reviews.map((review) => (
        <li key={review._id} className={styles.item}>
          <div className={styles.header}>
            <span className={styles.author}>
              {review.user?.firstName
                ? `${review.user.firstName} ${review.user.lastName?.[0] ?? ''}.`
                : 'אנונימי'}
            </span>
            {review.verifiedPurchase && <span className={styles.verified}>קנייה מאומתת</span>}
          </div>
          <StarRating value={review.rating} size="sm" />
          {review.comment && <p className={styles.comment}>{review.comment}</p>}
          <time className={styles.date} dateTime={review.createdAt}>
            {new Date(review.createdAt).toLocaleDateString('he-IL')}
          </time>
        </li>
      ))}
    </ul>
  );
}
