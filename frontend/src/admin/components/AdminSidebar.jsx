import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminSidebar.module.css';

const links = [
  { to: '/admin', label: 'לוח בקרה', icon: '📊', end: true },
  { to: '/admin/products', label: 'מוצרים', icon: '📦' },
  { to: '/admin/orders', label: 'הזמנות', icon: '🛒' },
  { to: '/admin/categories', label: 'קטגוריות', icon: '🗂️' },
  { to: '/admin/coupons', label: 'קופונים', icon: '🏷️' },
  { to: '/admin/reviews', label: 'ביקורות', icon: '⭐' },
  { to: '/admin/customers', label: 'לקוחות', icon: '👥' },
];

export default function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <img
          src="/images/logo-emblem.png"
          alt=""
          className={styles.brandLogo}
        />
        <span className={styles.brandText}>
          פארך
          <span className={styles.brandSubtext}>פאנל ניהול</span>
        </span>
      </div>

      <Link to="/" className={styles.backToStore}>
        ← חזרה לחנות
      </Link>

      <nav className={styles.nav}>
        {links.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.linkActive : ''}`
            }
          >
            <span className={styles.icon} aria-hidden="true">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <button className={styles.logout} onClick={handleLogout}>
        יציאה
      </button>
    </aside>
  );
}
