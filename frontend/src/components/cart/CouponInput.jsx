import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import styles from './CouponInput.module.css';

export default function CouponInput() {
  const { coupon, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await applyCoupon(code.trim());
      setCode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (coupon) {
    return (
      <div className={styles.applied}>
        <span>קופון "{coupon.code}" הופעל</span>
        <button type="button" onClick={removeCoupon}>
          הסר
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="קוד קופון"
        className={styles.input}
      />
      <button type="submit" className={styles.button} disabled={loading}>
        החל
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}
