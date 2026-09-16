import { Link } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb';
import business from '../config/business';
import content from './ContentPage.module.css';
import styles from './FaqPage.module.css';

const sections = [
  {
    title: 'הזמנות ותשלום',
    items: [
      {
        q: 'אילו אמצעי תשלום ניתן להשתמש בהם?',
        a: 'ניתן לשלם בכרטיסי אשראי ישראליים ובינלאומיים. הסליקה מתבצעת אצל ספק מורשה בתקן PCI-DSS — פרטי הכרטיס אינם נשמרים אצלנו כלל.',
      },
      {
        q: 'האם מקבלים חשבונית?',
        a: 'כן. בגין כל רכישה מופקת חשבונית או קבלה כדין, והיא נשלחת אליכם בדוא"ל מיד לאחר אישור התשלום.',
      },
      {
        q: 'שכחתי להזין קוד קופון — אפשר להוסיף אותו בדיעבד?',
        a: 'קוד קופון יש להזין בסל הקניות לפני מעבר לתשלום. אם פספסתם, פנו אלינו מיד לאחר ההזמנה ונשתדל לסייע.',
      },
      {
        q: 'איך אני עוקב אחרי ההזמנה שלי?',
        a: 'בעמוד "ההזמנות שלי" באזור האישי מוצג הסטטוס המעודכן של כל הזמנה. בנוסף, עם יציאת החבילה נשלח אליכם מספר מעקב בדוא"ל.',
      },
    ],
  },
  {
    title: 'משלוחים',
    items: [
      {
        q: 'כמה זמן לוקח המשלוח?',
        a: 'משלוח שליח עד הבית מגיע בדרך כלל תוך 2–5 ימי עסקים. פריטים בהתאמה אישית דורשים 3–7 ימי הכנה נוספים לפני היציאה למשלוח.',
      },
      {
        q: 'מתי המשלוח חינם?',
        a: 'בכל הזמנה מעל ₪249 המשלוח על חשבוננו. ההנחה מוחלת אוטומטית בעמוד התשלום.',
      },
      {
        q: 'האם אפשר לאסוף את ההזמנה?',
        a: 'כן, איסוף עצמי אפשרי בתיאום מראש וללא עלות. פנו אלינו לתיאום לאחר ביצוע ההזמנה.',
      },
    ],
  },
  {
    title: 'החזרות והחלפות',
    items: [
      {
        q: 'תוך כמה זמן אפשר להחזיר מוצר?',
        a: 'בתוך 14 ימים ממועד קבלת המוצר, כל עוד לא נעשה בו שימוש והוא באריזתו המקורית בצירוף החשבונית.',
      },
      {
        q: 'למה אי אפשר להחזיר תפילין או מזוזה?',
        a: 'תשמישי קדושה שנפתחו או נבדקו אינם ניתנים להחזרה, בהתאם לתקנות הגנת הצרכן ולאופי הפריט. מדיניות ההחזרה מוצגת בבירור בעמוד כל מוצר לפני הרכישה.',
      },
      {
        q: 'קיבלתי מוצר פגום — מה עושים?',
        a: 'פנו אלינו בתוך 14 ימים בצירוף תמונות. נחליף, נתקן או נזכה אתכם במלוא הסכום, ללא כל עלות משלוח מצדכם.',
      },
    ],
  },
  {
    title: 'מוצרים וכשרות',
    items: [
      {
        q: 'מה ההשגחה על המוצרים?',
        a: 'לכל פריט הדורש השגחה מצוינת בעמוד המוצר גוף הכשרות המפקח עליו. תעודת כשרות מצורפת לפריטים הרלוונטיים.',
      },
      {
        q: 'איך בוחרים מידה של טלית או בגד ציצית?',
        a: 'בעמוד כל מוצר מופיעה טבלת מידות עם המידה בסנטימטרים. אם אתם מתלבטים — נשמח לייעץ בטלפון או בדוא"ל.',
      },
      {
        q: 'האם אפשר להזמין קשירת ציצית מיוחדת?',
        a: 'כן. אנו קושרים לפי מנהגי אשכנז, ספרד, חב"ד ותימן. ניתן לבחור את סוג הקשירה בעמוד המוצר, או לפנות אלינו לבקשה מיוחדת.',
      },
      {
        q: 'האם החיפוש עובד גם בלי ניקוד?',
        a: 'כן. מנוע החיפוש שלנו מזהה מילים עם ניקוד ובלעדיו, כך שתמצאו את המוצר בכל צורת כתיבה.',
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className={content.page}>
      <div className={content.banner}>
        <span className={content.eyebrow}>שירות לקוחות</span>
        <h1 className={content.bannerTitle}>שאלות נפוצות</h1>
        <p className={content.bannerText}>
          ריכזנו כאן את השאלות שאנחנו נשאלים הכי הרבה. לא מצאתם תשובה? נשמח לעזור.
        </p>
      </div>

      <div className="container">
        <Breadcrumb items={[{ label: 'דף הבית', href: '/' }, { label: 'שאלות נפוצות' }]} />

        <div className={styles.sections}>
          {sections.map((section) => (
            <section key={section.title} className={styles.section}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              {section.items.map((item) => (
                <details key={item.q} className={styles.item}>
                  <summary className={styles.question}>
                    <span>{item.q}</span>
                    <span className={styles.chevron} aria-hidden="true">▾</span>
                  </summary>
                  <p className={styles.answer}>{item.a}</p>
                </details>
              ))}
            </section>
          ))}
        </div>

        <aside className={styles.help}>
          <h2>לא מצאתם את מה שחיפשתם?</h2>
          <p>
            צוות השירות שלנו זמין בטלפון{' '}
            <a href={`tel:${business.phoneDial}`} dir="ltr">{business.phone}</a> ובדוא"ל{' '}
            <a href={`mailto:${business.email}`} dir="ltr">{business.email}</a>.
          </p>
          <Link to="/contact" className={styles.helpLink}>למעבר לעמוד יצירת קשר</Link>
        </aside>
      </div>
    </div>
  );
}
