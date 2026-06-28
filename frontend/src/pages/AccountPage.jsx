import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoginForm from '../components/account/LoginForm.jsx';
import RegisterForm from '../components/account/RegisterForm.jsx';
import styles from './AccountPage.module.css';

export default function AccountPage() {
  const { user, logout, loading } = useAuth();
  const [view, setView] = useState('login'); // 'login' | 'register'
  const [logoutLoading, setLogoutLoading] = useState(false);

  if (loading) {
    return (
      <main className={styles.page}>
        <p className={styles.loadingText}>טוען...</p>
      </main>
    );
  }

  if (user) {
    return (
      <main className={styles.page}>
        <section className={styles.dashboard} aria-label="פרטי חשבון">
          <h1 className={styles.welcome}>
            שלום, {user.firstName}!
          </h1>
          <p className={styles.email}>{user.email}</p>

          <div className={styles.actions}>
            <Link to="/orders" className={styles.actionLink}>
              ההזמנות שלי
            </Link>
          </div>

          <button
            className={styles.logoutButton}
            onClick={async () => {
              setLogoutLoading(true);
              try {
                await logout();
              } finally {
                setLogoutLoading(false);
              }
            }}
            disabled={logoutLoading}
          >
            {logoutLoading ? 'מתנתק...' : 'התנתקות'}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={view === 'login'}
          className={`${styles.tab} ${view === 'login' ? styles.tabActive : ''}`}
          onClick={() => setView('login')}
        >
          התחברות
        </button>
        <button
          role="tab"
          aria-selected={view === 'register'}
          className={`${styles.tab} ${view === 'register' ? styles.tabActive : ''}`}
          onClick={() => setView('register')}
        >
          הרשמה
        </button>
      </div>

      <div className={styles.formWrapper}>
        {view === 'login' ? (
          <LoginForm onSwitchToRegister={() => setView('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setView('login')} />
        )}
      </div>
    </main>
  );
}
