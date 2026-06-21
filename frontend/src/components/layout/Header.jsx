import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import SearchBar from '../ui/SearchBar';
import { useCart } from '../../context/CartContext';
import styles from './Header.module.css';

export default function Header() {
  const { itemCount, openDrawer } = useCart();

  return (
    <header className={styles.header}>
      <div className={styles.row}>
        <Link to="/" className={styles.logo}>
          [שם האתר]
        </Link>
        <SearchBar />
        <div className={styles.actions}>
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
