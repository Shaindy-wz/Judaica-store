import { Link } from 'react-router-dom';
import business from '../../config/business';
import styles from './TopBar.module.css';

export default function TopBar() {
  return (
    <div className={styles.topbar}>
      <div className={styles.left}>
        <Link to="/contact">צור קשר</Link>
        <Link to="/faq">שאלות נפוצות</Link>
        <Link to="/shipping-returns">משלוחים והחזרות</Link>
      </div>
      <div className={styles.right}>
        <span className={styles.note}>משלוח חינם בהזמנה מעל ₪249</span>
        <a href={`tel:${business.phoneDial}`} dir="ltr">{business.phone}</a>
      </div>
    </div>
  );
}
