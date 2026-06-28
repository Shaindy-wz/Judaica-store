import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useSearch } from '../../context/SearchContext';
import styles from './Header.module.css';

export default function Header() {
  const { itemCount, openDrawer } = useCart();
  const { user } = useAuth();
  const { setIsOpen } = useSearch();

  return (
    <header className={styles.header}>
      <div className={styles.row}>
        <div className={styles.sideGroup}>
          <button
            type="button"
            aria-label="חיפוש מוצרים"
            className={styles.iconLink}
            onClick={() => setIsOpen(true)}
          >
            🔍
          </button>
          <Link to="/account" aria-label="החשבון שלי" className={styles.iconLink}>
            👤
          </Link>
        </div>

        <Link to="/" className={styles.logo}>
          <img
            src="/images/logo-emblem.png"
            alt="פארך — תשמישי קדושה"
            className={styles.logoMark}
          />
          <span className={styles.logoText}>פארך</span>
          <span className={styles.logoTagline}>תשמישי קדושה</span>
        </Link>

        <div className={styles.sideGroup}>
          {user?.role === 'admin' && (
            <Link to="/admin" className={styles.adminLink} aria-label="פאנל ניהול">
              ניהול
            </Link>
          )}
          <button
            type="button"
            aria-label="עגלת קניות"
            className={styles.cartLink}
            onClick={openDrawer}
          >
            🛒
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </button>
        </div>
      </div>
      <Navbar />
    </header>
  );
}
