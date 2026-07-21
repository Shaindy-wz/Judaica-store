import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import categoryService from '../../services/categoryService';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => {});
  }, []);

  return (
    <nav className={styles.navbar}>
      <ul className={styles.list}>
        {categories.map((cat) => (
          <li key={cat._id} className={cat.children?.length ? styles.hasDropdown : ''}>
            <NavLink
              to={`/category/${cat.slug}`}
              className={({ isActive }) => (isActive ? styles.active : undefined)}
            >
              {cat.name}
              {cat.children?.length > 0 && <span className={styles.arrow} aria-hidden="true">▾</span>}
            </NavLink>

            {cat.children?.length > 0 && (
              <ul className={styles.dropdown} role="menu">
                {cat.children.map((sub) => (
                  <li key={sub._id}>
                    <NavLink
                      to={`/category/${sub.slug}`}
                      role="menuitem"
                      className={({ isActive }) => (isActive ? styles.dropdownActive : undefined)}
                    >
                      {sub.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
