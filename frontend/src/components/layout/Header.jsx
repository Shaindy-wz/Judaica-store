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
        <Link to="/" className={styles.logo}>
          [שם האתר]
        </Link>
        <div className={styles.actions}>
          {user?.role === 'admin' && (
            <Link to="/admin" className={styles.adminLink} aria-label="פאנל ניהול">
              ניהול
            </Link>
          )}
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
