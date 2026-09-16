/**
 * ⚠️  Shipping & returns policy. The cancellation-rights wording is drafted from
 * docs/specs/10-legal-and-compliance.md §13.1 and must be reviewed by a qualified
 * Israeli attorney. Shipping rates and lead times are PLACEHOLDERS pending the
 * client's shipping-provider decision (open question §20.7).
 */
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb';
import business from '../config/business';
import content from './ContentPage.module.css';

const shippingOptions = [
  ['משלוח שליח עד הבית', '2–5 ימי עסקים', '₪29'],
  ['איסוף מנקודת חלוקה', '3–6 ימי עסקים', '₪19'],
  ['דואר רשום', '5–10 ימי עסקים', '₪19'],
  ['איסוף עצמי (בתיאום מראש)', 'למחרת יום העסקים', 'ללא עלות'],
];

export default function ShippingReturnsPage() {
  return (
    <div className={content.page}>
      <div className={content.banner}>
        <span className={content.eyebrow}>שירות לקוחות</span>
        <h1 className={content.bannerTitle}>משלוחים והחזרות</h1>
        <p className={content.bannerText}>
          כל מה שצריך לדעת על מועדי האספקה, עלויות המשלוח וזכות הביטול.
        </p>
      </div>

      <div className="container">
        <Breadcrumb items={[{ label: 'דף הבית', href: '/' }, { label: 'משלוחים והחזרות' }]} />

        <article className={content.article}>
          <div className={content.callout}>
            <p>
              <strong>משלוח חינם בהזמנה מעל ₪249.</strong> ההנחה מוחלת אוטומטית בעמוד התשלום, ללא
              צורך בקוד קופון.
            </p>
          </div>

          <section>
            <h2>אפשרויות משלוח ועלויות</h2>
            <div className={content.tableWrap}>
              <table className={content.table}>
                <thead>
                  <tr>
                    <th>שיטת משלוח</th>
                    <th>זמן אספקה משוער</th>
                    <th>עלות</th>
                  </tr>
                </thead>
                <tbody>
                  {shippingOptions.map(([method, time, price]) => (
                    <tr key={method}>
                      <th scope="row">{method}</th>
                      <td>{time}</td>
                      <td>{price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              זמני האספקה נספרים בימי עסקים (ראשון–חמישי) ממועד אישור התשלום, ואינם כוללים שבתות,
              חגים וערבי חג. הזמנה שהתקבלה לאחר השעה 14:00 נכנסת לטיפול ביום העסקים הבא.
            </p>
          </section>

          <section>
            <h2>מוצרים בהתאמה אישית</h2>
            <p>
              פריטים הכוללים רקמה, חריטה או קשירת ציצית לפי בקשה דורשים זמן הכנה נוסף של
              <strong> 3–7 ימי עסקים</strong> לפני המשלוח. זמן ההכנה מצוין בעמוד המוצר, ונציג יעדכן
              אתכם במועד המשוער לאחר אישור פרטי ההתאמה.
            </p>
          </section>

          <section>
            <h2>מעקב אחר ההזמנה</h2>
            <p>
              עם יציאת החבילה תישלח אליכם הודעת דוא"ל עם מספר מעקב. בנוסף, ניתן לצפות בסטטוס ההזמנה
              בכל רגע בעמוד <Link to="/orders">ההזמנות שלי</Link> באזור האישי.
            </p>
          </section>

          <section>
            <h2>זכות ביטול והחזרת מוצרים</h2>
            <p>
              בהתאם לחוק הגנת הצרכן, התשמ"א-1981, ניתן לבטל עסקה ולהחזיר מוצר בתוך
              <strong> 14 ימים ממועד קבלתו</strong>, ובלבד שהמוצר לא נעשה בו שימוש, לא ניזוק, והוא
              מוחזר באריזתו המקורית ובצירוף החשבונית.
            </p>

            <h3>איך מבצעים החזרה</h3>
            <ol>
              <li>
                פונים אלינו בדוא"ל{' '}
                <a href={`mailto:${business.email}`} dir="ltr">{business.email}</a> או בטלפון{' '}
                <a href={`tel:${business.phoneDial}`} dir="ltr">{business.phone}</a>, בציון מספר
                ההזמנה וסיבת ההחזרה.
              </li>
              <li>נציג יאשר את ההחזרה וימסור לכם את כתובת המשלוח או יתאם איסוף.</li>
              <li>אורזים את המוצר באריזתו המקורית יחד עם החשבונית.</li>
              <li>
                לאחר קבלת המוצר ובדיקתו, הזיכוי מבוצע לאמצעי התשלום המקורי בתוך עד 14 ימי עסקים.
              </li>
            </ol>

            <h3>דמי ביטול</h3>
            <p>
              בביטול עסקה שאינו עקב פגם, החברה רשאית לגבות דמי ביטול בשיעור של עד 5% ממחיר העסקה או
              ₪100 — לפי הנמוך מביניהם. עלות המשלוח החוזר חלה על הלקוח, למעט במקרה של פגם או אספקת
              מוצר שגוי — שאז אנו נושאים במלוא העלות.
            </p>

            <h3>מוצרים שאינם ניתנים להחזרה</h3>
            <ul>
              <li>
                <strong>תפילין ומזוזות שנפתחו או נבדקו</strong> — תשמישי קדושה שהוצאו מאריזתם אינם
                ניתנים להחזרה.
              </li>
              <li>
                <strong>מוצרים בהתאמה אישית</strong> — רקמה, חריטה, קשירה או חיתוך שבוצעו לבקשת
                הלקוח.
              </li>
              <li>מוצרים שנפגמו או נעשה בהם שימוש לאחר המסירה.</li>
            </ul>
            <p>
              מדיניות ההחזרה של כל מוצר מוצגת במפורש בעמוד המוצר, לפני ביצוע הרכישה. הנוסח המשפטי
              המלא מופיע ב<Link to="/terms">תקנון האתר</Link>.
            </p>
          </section>

          <section>
            <h2>מוצר פגום או שגוי</h2>
            <p>
              קיבלתם מוצר פגום, קרוע או שאינו תואם להזמנה? צרו קשר בתוך 14 ימים מקבלת החבילה בצירוף
              תמונות. נחליף את המוצר, נתקן אותו או נזכה אתכם במלוא הסכום — לפי בחירתכם — וללא כל
              עלות משלוח מצדכם.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
