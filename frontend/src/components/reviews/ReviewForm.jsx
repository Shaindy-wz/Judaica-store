import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import reviewService from '../../services/reviewService';
import styles from './ReviewForm.module.css';

export default function ReviewForm({ productId, onSubmitted }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <p className={styles.notice}>
        רק משתמשים רשומים שרכשו את המוצר יכולים לדרג אותו.{' '}
        <Link to="/account">התחבר/י</Link> כדי לכתוב ביקורת.
      </p>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setStatus({ type: 'error', message: 'יש לבחור דירוג' });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      await reviewService.submit(productId, { rating, comment });
      setStatus({ type: 'success', message: 'תודה! הביקורת תפורסם לאחר אישור מנהל.' });
      setRating(0);
      setComment('');
      onSubmitted?.();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.title}>כתוב ביקורת</h3>
      <div className={styles.starsInput} role="radiogroup" aria-label="דירוג בכוכבים">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            aria-label={`${star} כוכבים`}
            aria-pressed={rating === star}
            className={star <= rating ? styles.starActive : styles.star}
            onClick={() => setRating(star)}
          >
            ★
          </button>
        ))}
      </div>
      <label className={styles.commentLabel} htmlFor="review-comment">
        תגובה (לא חובה)
      </label>
      <textarea
        id="review-comment"
        className={styles.textarea}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
      />
      {status && (
        <p className={status.type === 'error' ? styles.error : styles.success} role="status">
          {status.message}
        </p>
      )}
      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? 'שולח…' : 'שלח ביקורת'}
      </button>
    </form>
  );
}
