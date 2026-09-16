import { Link } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb';
import Button from '../components/ui/Button';
import business from '../config/business';
import content from './ContentPage.module.css';
import styles from './AboutPage.module.css';

const values = [
  {
    icon: '📜',
    title: 'הידור והשגחה',
    text: 'כל פריט מגיע עם השגחה מוסמכת ותעודת כשרות, ונבחר בקפידה לפי כללי ההידור המקובלים.',
  },
  {
    icon: '✋',
    title: 'עבודת יד',
    text: 'ציציות נקשרות בעבודת יד, וכל טלית עוברת בדיקה אישית לפני שהיא נארזת ונשלחת.',
  },
  {
    icon: '🎁',
    title: 'אריזה מהודרת',
    text: 'כל הזמנה מגיעה באריזת מתנה מכובדת — מוכנה לבר מצווה, לחתונה או לכל שמחה.',
  },
  {
    icon: '🤝',
    title: 'ליווי אישי',
    text: 'לא בטוחים איזו מידה או איזה סוג מתאים? צוות השירות שלנו ילווה אתכם עד לבחירה הנכונה.',
  },
];

export default function AboutPage() {
  return (
    <div className={content.page}>
      <div className={content.banner}>
        <span className={content.eyebrow}>הכירו אותנו</span>
        <h1 className={content.bannerTitle}>אודות {business.name}</h1>
        <p className={content.bannerText}>
          בית לתשמישי קדושה — מסורת, הידור ואיכות שעוברת מדור לדור.
        </p>
      </div>

      <div className="container">
        <Breadcrumb items={[{ label: 'דף הבית', href: '/' }, { label: 'אודות' }]} />

        <section className={styles.intro}>
          <div className={styles.introText}>
            <h2 className="section-title">הסיפור שלנו</h2>
            <p>
              {business.name} עוסקת בייצור ובהפצה של תשמישי קדושה — טליתות, ציציות, תפילין, מזוזות
              ופריטי שבת. אנחנו מלווים משפחות ברגעים המשמעותיים ביותר: בר מצווה, חתונה, כניסה לבית
              חדש והמשך שגרת החיים היהודית.
            </p>
            <p>
              העיקרון שמנחה אותנו פשוט — תשמיש קדושה אינו מוצר מדף. הוא נבחר בקפידה, מיוצר בהידור,
              ומלווה בהסבר ובייעוץ. לכן כל פריט בקטלוג נבדק לפני שהוא נכנס לאתר, וכל הזמנה עוברת
              בדיקה נוספת לפני המשלוח.
            </p>
            <p>
              אנחנו מאמינים שגם קנייה מקוונת יכולה להרגיש אישית. אם יש שאלה — על מידה, על סוג קשירה
              או על ההשגחה — אנחנו כאן.{' '}
              <Link to="/contact">דברו איתנו</Link>.
            </p>
          </div>

          <div className={styles.introVisual} aria-hidden="true">
            <img src="/images/logo-emblem.png" alt="" className={styles.emblem} />
          </div>
        </section>

        <section className={styles.valuesSection}>
          <h2 className="section-title">מה שחשוב לנו</h2>
          <div className={styles.values}>
            {values.map((value) => (
              <article key={value.title} className={styles.value}>
                <span className={styles.valueIcon} aria-hidden="true">{value.icon}</span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.cta}>
          <h2>מוכנים לבחור?</h2>
          <p>עיינו בקטלוג המלא, או פנו אלינו לייעוץ אישי לפני הרכישה.</p>
          <div className={styles.ctaActions}>
            <Button href="/shop" variant="gold">לחנות</Button>
            <Button href="/contact" variant="outline-light">צור קשר</Button>
          </div>
        </section>
      </div>
    </div>
  );
}
