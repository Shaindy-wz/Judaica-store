import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from './RegisterForm.module.css';

export default function RegisterForm({ onSuccess, onSwitchToLogin }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    marketingConsent: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.firstName || !form.lastName) {
      setError('נא למלא שם פרטי ושם משפחה');
      return;
    }
    if (form.password.length < 8) {
      setError('הסיסמה חייבת להכיל לפחות 8 תווים');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'שגיאה ברישום');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.title}>יצירת חשבון</h2>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="reg-first-name" className={styles.label}>
            שם פרטי
          </label>
          <input
            id="reg-first-name"
            type="text"
            autoComplete="given-name"
            value={form.firstName}
            onChange={set('firstName')}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="reg-last-name" className={styles.label}>
            שם משפחה
          </label>
          <input
            id="reg-last-name"
            type="text"
            autoComplete="family-name"
            value={form.lastName}
            onChange={set('lastName')}
            className={styles.input}
            required
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="reg-email" className={styles.label}>
          כתובת אימייל
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
          className={styles.input}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="reg-password" className={styles.label}>
          סיסמה <span className={styles.hint}>(לפחות 8 תווים)</span>
        </label>
        <input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={set('password')}
          className={styles.input}
          required
          minLength={8}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="reg-phone" className={styles.label}>
          טלפון <span className={styles.hint}>(אופציונלי)</span>
        </label>
        <input
          id="reg-phone"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={set('phone')}
          className={styles.input}
        />
      </div>

      {/* Marketing consent — must default to unchecked (opt-in) per Israeli law */}
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={form.marketingConsent}
          onChange={set('marketingConsent')}
          className={styles.checkbox}
        />
        <span>אני מסכים/ה לקבל עדכונים והצעות מיוחדות במייל</span>
      </label>

      <button type="submit" className={styles.submit} disabled={loading}>
        {loading ? 'נרשם...' : 'צור חשבון'}
      </button>

      {onSwitchToLogin && (
        <p className={styles.switch}>
          כבר יש לך חשבון?{' '}
          <button type="button" className={styles.switchLink} onClick={onSwitchToLogin}>
            התחברות
          </button>
        </p>
      )}
    </form>
  );
}
