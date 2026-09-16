import { Link } from 'react-router-dom';
import styles from './ReturnPolicyNotice.module.css';

/**
 * Per-product return notice — required by the Consumer Protection Law.
 * See docs/specs/10-legal-and-compliance.md §13.1: the wording is driven by the
 * `Product.returnPolicy` fields, so it stays accurate per product.
 */
export default function ReturnPolicyNotice({ returnPolicy }) {
  const { returnable = true, customizable = false, nonReturnableReason } = returnPolicy ?? {};

  let tone = 'ok';
  let title = 'ניתן לביטול תוך 14 ימים';
  let text =
    'ניתן לבטל את העסקה ולהחזיר את המוצר בתוך 14 ימים ממועד קבלתו, כל עוד לא נעשה בו שימוש והוא באריזתו המקורית.';

  if (!returnable) {
    tone = 'warn';
    title = 'מוצר שאינו ניתן להחזרה';
    text =
      nonReturnableReason ??
      'זהו תשמיש קדושה — לאחר פתיחת האריזה או בדיקת הפריט לא ניתן להחזירו, בהתאם לתקנות הגנת הצרכן.';
  } else if (customizable) {
    tone = 'warn';
    title = 'מוצר בהתאמה אישית';
    text =
      'מוצר זה מיוצר או מותאם במיוחד עבורכם, ולכן אינו ניתן להחזרה לאחר תחילת הביצוע — בהתאם לתקנות הגנת הצרכן. נשמח לוודא איתכם את כל פרטי ההתאמה לפני שמתחילים בעבודה.';
  }

  return (
    <aside className={`${styles.notice} ${styles[tone]}`}>
      <span className={styles.icon} aria-hidden="true">{tone === 'warn' ? '⚠' : '↩'}</span>
      <div>
        <strong className={styles.title}>{title}</strong>
        <p className={styles.text}>
          {text}{' '}
          <Link to="/shipping-returns">למדיניות המלאה</Link>
        </p>
      </div>
    </aside>
  );
}
