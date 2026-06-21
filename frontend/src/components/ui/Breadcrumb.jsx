import { Link } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

export default function Breadcrumb({ items }) {
  return (
    <nav className={styles.breadcrumb} aria-label="breadcrumb">
      {items.map((item, index) => (
        <span key={item.href ?? item.label} className={styles.item}>
          {item.href ? <Link to={item.href}>{item.label}</Link> : <span>{item.label}</span>}
          {index < items.length - 1 && <span className={styles.separator}>/</span>}
        </span>
      ))}
    </nav>
  );
}
