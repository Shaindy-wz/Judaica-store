import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useSearch } from '../../context/SearchContext';
import categoryService from '../../services/categoryService';
import styles from './Header.module.css';

export default function Header() {
  const { itemCount, openDrawer } = useCart();
  const { user } = useAuth();
  const { setIsOpen } = useSearch();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => {});
  }, []);

  function renderCatItem(cat) {
    return (
      <li key={cat._id} className={cat.children?.length ? styles.hasDropdown : ''}>
        <NavLink
          to={`/category/${cat.slug}`}
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
          }
        >
          {cat.name}
          {cat.children?.length > 0 && (
            <span className={styles.arrow} aria-hidden="true">▾</span>
          )}
        </NavLink>
        {cat.children?.length > 0 && (
          <ul className={styles.dropdown} role="menu">
            {cat.children.map((sub) => (
              <li key={sub._id}>
                <NavLink
                  to={`/category/${sub.slug}`}
                  role="menuitem"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                  }
                >
                  {sub.name}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <header className={styles.header}>
      <div className={styles.row}>

        {/* Column 1 — Logo, far RIGHT in RTL */}
        <Link to="/" className={styles.logo}>
          <img
            src="/images/logo-emblem.png"
            alt="פארך — תשמישי קדושה"
            className={styles.logoMark}
          />
          <span className={styles.logoText}>פארך</span>
          <span className={styles.logoTagline}>תשמישי קדושה</span>
        </Link>

        {/* Column 2 — All categories, spread equally across center */}
        <nav aria-label="ניווט ראשי" className={styles.navCenter}>
          <ul className={styles.navCenterList}>
            {categories.map(renderCatItem)}
          </ul>
        </nav>

        {/* Column 3 — Search (rightmost) + icons + admin, far LEFT in RTL */}
        <nav aria-label="פעולות משתמש" className={styles.navActions}>
          <ul className={styles.navActionsList}>
            <li>
              <button
                type="button"
                aria-label="חיפוש מוצרים"
                className={styles.searchBtn}
                onClick={() => setIsOpen(true)}
              >
                🔍 <span>חיפוש</span>
              </button>
            </li>
            <li className={styles.iconItem}>
              <Link to="/account" aria-label="החשבון שלי" className={styles.iconLink}>👤</Link>
            </li>
            <li className={styles.iconItem}>
              <button
                type="button"
                aria-label="עגלת קניות"
                className={styles.cartLink}
                onClick={openDrawer}
              >
                🛒
                {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
              </button>
            </li>
            {user?.role === 'admin' && (
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `${styles.navAdminLink} ${isActive ? styles.navAdminLinkActive : ''}`
                  }
                >
                  🛠 ניהול
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

      </div>
    </header>
  );
}
