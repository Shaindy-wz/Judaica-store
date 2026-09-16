import { Link } from 'react-router-dom';
import business, { fullAddress, whatsappUrl } from '../../config/business';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.brandBand}>
        <Link to="/" className={styles.brand}>
          <img
            src="/images/logo-emblem.png"
            alt="פארך — תשמישי קדושה"
            className={styles.brandMark}
          />
        </Link>
        <h2 className={styles.brandText}>{business.name}</h2>
        <p className={styles.brandTagline}>תשמישי קדושה מסורתיים ואיכותיים — ייצור והפצה</p>
      </div>

      <div className={styles.divider} aria-hidden="true">
        <span /><i /><span />
      </div>

      <div className={styles.columns}>
        <div className={styles.column}>
          <h3>קטגוריות</h3>
          <ul>
            <li><Link to="/category/tzitzit">ציצית</Link></li>
            <li><Link to="/category/prayer-shawls">טליתות</Link></li>
            <li><Link to="/category/tefillin">תפילין</Link></li>
            <li><Link to="/category/mezuzot">מזוזות</Link></li>
            <li><Link to="/shop">כל המוצרים</Link></li>
          </ul>
        </div>
        <div className={styles.column}>
          <h3>שירות לקוחות</h3>
          <ul>
            <li><Link to="/contact">צור קשר</Link></li>
            <li><Link to="/faq">שאלות נפוצות</Link></li>
            <li><Link to="/shipping-returns">משלוחים והחזרות</Link></li>
            <li><Link to="/orders">מעקב הזמנות</Link></li>
          </ul>
        </div>
        <div className={styles.column}>
          <h3>אודות</h3>
          <ul>
            <li><Link to="/about">הסיפור שלנו</Link></li>
            <li><Link to="/accessibility-statement">נגישות</Link></li>
            <li><Link to="/terms">תקנון</Link></li>
            <li><Link to="/privacy-policy">מדיניות פרטיות</Link></li>
          </ul>
        </div>
        <div className={styles.column}>
          <h3>פרטי קשר</h3>
          <ul>
            <li>
              <a href={`tel:${business.phoneDial}`} dir="ltr">{business.phone}</a>
            </li>
            <li>
              <a href={`mailto:${business.email}`} dir="ltr">{business.email}</a>
            </li>
            {whatsappUrl && (
              <li>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">וואטסאפ</a>
              </li>
            )}
            <li className={styles.plain}>{fullAddress}</li>
            <li className={styles.plain}>{business.hours[0].days}: {business.hours[0].time}</li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        {/* Legal business identity — required by the Consumer Protection Law */}
        <p className={styles.legal}>
          {business.legalName}
          {business.businessId && ` · ח.פ./ע.מ. ${business.businessId}`}
          {' · '}
          {fullAddress}
        </p>
        <p>© {new Date().getFullYear()} {business.name}. כל הזכויות שמורות</p>
      </div>
    </footer>
  );
}
