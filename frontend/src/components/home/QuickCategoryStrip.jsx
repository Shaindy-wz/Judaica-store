import { Link } from 'react-router-dom';
import styles from './QuickCategoryStrip.module.css';

const quickLinks = [
  { label: 'טליתות', href: '/category/prayer-shawls' },
  { label: 'ציציות', href: '/category/tzitzit' },
  { label: 'מזוזות', href: '/category/mezuzot' },
  { label: 'תפילין', href: '/category/tefillin' },
  { label: 'כיפות', href: '/category/kippot' },
  { label: 'פתילים', href: '/category/wicks' },
  { label: 'שבת', href: '/category/shabbat' },
  { label: 'נרתיקים', href: '/category/talit-tefillin-covers' },
  { label: 'סידורים', href: '/category/siddurim' },
];

export default function QuickCategoryStrip() {
  return (
    <div className={styles.strip}>
      {quickLinks.map((link) => (
        <Link key={link.href} to={link.href} className={styles.link}>
          {link.label}
        </Link>
      ))}
    </div>
  );
}
