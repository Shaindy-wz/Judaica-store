import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from './LoginForm.module.css';

export default function LoginForm({ onSuccess, onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.title}>התחברות</h2>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.field}>
        <label htmlFor="login-email" className={styles.label}>
          כתובת אימייל
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="login-password" className={styles.label}>
          סיסמה
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          required
        />
      </div>

      <button type="submit" className={styles.submit} disabled={loading}>
        {loading ? 'מתחבר...' : 'התחברות'}
      </button>

      {onSwitchToRegister && (
        <p className={styles.switch}>
          אין לך חשבון?{' '}
          <button type="button" className={styles.switchLink} onClick={onSwitchToRegister}>
            הירשם כאן
          </button>
        </p>
      )}
    </form>
  );
}
