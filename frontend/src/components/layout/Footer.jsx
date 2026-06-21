import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.columns}>
        <div className={styles.column}>
          <h3>[שם האתר]</h3>
          <p>תשמישי קדושה מסורתיים ואיכותיים — ייצור והפצה.</p>
        </div>
        <div className={styles.column}>
          <h3>קטגוריות</h3>
          <ul>
            <li><Link to="/category/tzitzit">ציצית</Link></li>
            <li><Link to="/category/prayer-shawls">טליתות</Link></li>
            <li><Link to="/category/tefillin">תפילין</Link></li>
            <li><Link to="/category/mezuzot">מזוזות</Link></li>
          </ul>
        </div>
        <div className={styles.column}>
          <h3>שירות לקוחות</h3>
          <ul>
            <li><Link to="/contact">צור קשר</Link></li>
            <li><Link to="/branches">סניפים</Link></li>
          </ul>
        </div>
        <div className={styles.column}>
          <h3>פרטי קשר</h3>
          <ul>
            <li><a href="tel:1800707707">1-800-707-707</a></li>
          </ul>
        </div>
        <div className={styles.column}>
          <h3>משפטי</h3>
          <ul>
            <li><Link to="/terms">תקנון</Link></li>
            <li><Link to="/privacy-policy">מדיניות פרטיות</Link></li>
          </ul>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} [שם האתר]. כל הזכויות שמורות</p>
      </div>
    </footer>
  );
}
