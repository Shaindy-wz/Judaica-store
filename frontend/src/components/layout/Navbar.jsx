import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';

const menuItems = [
  { label: 'ציצית', href: '/category/tzitzit' },
  { label: 'טליתות', href: '/category/prayer-shawls' },
  { label: 'תפילין', href: '/category/tefillin' },
  { label: 'מזוזות', href: '/category/mezuzot' },
  { label: 'מתנות', href: '/category/general' },
  { label: 'שבת', href: '/category/shabbat' },
  { label: 'סניפים', href: '/branches' },
  { label: 'צור קשר', href: '/contact' },
];

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <ul className={styles.list}>
        {menuItems.map((item) => (
          <li key={item.href}>
            <NavLink
              to={item.href}
              className={({ isActive }) => (isActive ? styles.active : undefined)}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
