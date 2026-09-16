import { Link } from 'react-router-dom';
import styles from './CancellationRightsNotice.module.css';

/**
 * Full consumer-rights notice shown before the payment step.
 * See docs/specs/10-legal-and-compliance.md §13.1.
 */
export default function CancellationRightsNotice() {
  return (
    <section className={styles.notice} aria-label="זכות ביטול עסקה">
      <h3 className={styles.title}>זכות ביטול עסקה</h3>
      <ul className={styles.list}>
        <li>
          ניתן לבטל את העסקה בתוך <strong>14 ימים</strong> ממועד קבלת המוצר, בהתאם לחוק הגנת הצרכן,
          התשמ"א-1981.
        </li>
        <li>
          תשמישי קדושה שנפתחו או נבדקו, ומוצרים בהתאמה אישית (רקמה, חריטה או קשירה לפי בקשה),
          אינם ניתנים להחזרה.
        </li>
        <li>
          בביטול שאינו עקב פגם ייתכנו דמי ביטול של עד 5% ממחיר העסקה או ₪100 — לפי הנמוך מביניהם.
        </li>
      </ul>
      <p className={styles.links}>
        <Link to="/shipping-returns">מדיניות משלוחים והחזרות</Link>
        <span aria-hidden="true">·</span>
        <Link to="/terms">תקנון האתר</Link>
      </p>
    </section>
  );
}
