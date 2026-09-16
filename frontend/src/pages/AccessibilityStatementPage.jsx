/**
 * ⚠️  Mandatory page under the Israeli Accessibility Regulations (2013).
 * Content drafted from docs/specs/10-legal-and-compliance.md §13.2 — the final
 * wording, the conformance claim and the accessibility-coordinator details must
 * be confirmed by the business and reviewed by a qualified attorney before launch.
 */
import Breadcrumb from '../components/ui/Breadcrumb';
import business, { fullAddress } from '../config/business';
import content from './ContentPage.module.css';

export default function AccessibilityStatementPage() {
  return (
    <div className={content.page}>
      <div className={content.banner}>
        <span className={content.eyebrow}>מחויבות שלנו</span>
        <h1 className={content.bannerTitle}>הצהרת נגישות</h1>
      </div>

      <div className="container">
        <Breadcrumb items={[{ label: 'דף הבית', href: '/' }, { label: 'הצהרת נגישות' }]} />

        <article className={content.article}>
          <span className={content.updated}>
            בדיקת הנגישות האחרונה בוצעה בתאריך: {business.accessibilityReviewDate}
          </span>

          <div className={content.callout}>
            <p>
              אתר {business.name} שואף לאפשר לכל אדם — לרבות אנשים עם מוגבלות — לגלוש, לבחור ולרכוש
              באופן עצמאי, נוח ושוויוני. השקענו מאמץ ומשאבים בהנגשת האתר, ואנו ממשיכים לשפר אותו
              באופן שוטף.
            </p>
          </div>

          <section>
            <h2>רמת הנגישות באתר</h2>
            <p>
              האתר הונגש בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות),
              התשע"ג-2013, ועומד ברמת התאמה <strong>AA</strong> על פי התקן הישראלי ת"י 5568 המבוסס על
              הנחיות <span dir="ltr">WCAG 2.1</span> של ארגון <span dir="ltr">W3C</span>.
            </p>
          </section>

          <section>
            <h2>מה הונגש באתר</h2>
            <ul>
              <li>מבנה סמנטי תקין המאפשר ניווט נוח באמצעות קורא מסך.</li>
              <li>ניווט מלא באמצעות מקלדת בלבד, עם סימון ברור וקבוע של הפוקוס.</li>
              <li>טקסט חלופי לכל התמונות המשמעותיות באתר.</li>
              <li>תוויות מפורשות לכל שדות הטפסים ולכל הכפתורים המכילים אייקון בלבד.</li>
              <li>יחסי ניגודיות צבע העומדים בדרישת 4.5:1 לטקסט רגיל.</li>
              <li>כיבוד הגדרת המערכת להפחתת אנימציות (<span dir="ltr">prefers-reduced-motion</span>).</li>
              <li>התאמה מלאה לגלישה בסמארטפון ובטאבלט.</li>
            </ul>
          </section>

          <section>
            <h2>כפתור הנגישות</h2>
            <p>
              בפינת המסך מוצג כפתור נגישות קבוע (סמל <span aria-hidden="true">♿</span>), הפותח תפריט
              התאמות אישיות:
            </p>
            <ul>
              <li>הגדלה והקטנה של גודל הטקסט</li>
              <li>מצב ניגודיות גבוהה</li>
              <li>הדגשת קישורים</li>
              <li>עצירת אנימציות</li>
              <li>גופן קריא ידידותי לדיסלקציה</li>
            </ul>
            <p>
              ההעדפות שתבחרו נשמרות בדפדפן שלכם וממשיכות לפעול בביקורים הבאים. כפתור הנגישות מהווה
              תוספת ואינו מחליף את עבודת ההנגשה של האתר עצמו.
            </p>
          </section>

          <section>
            <h2>מגבלות ידועות</h2>
            <p>
              למרות מאמצינו, ייתכן שיימצאו באתר רכיבים שטרם הונגשו במלואם — בפרט תכנים המוטמעים
              מצדדים שלישיים, שאינם בשליטתנו המלאה. אנו פועלים לתיקון כל ליקוי שמדווח לנו.
            </p>
          </section>

          <section>
            <h2>נתקלתם בבעיית נגישות?</h2>
            <p>
              נשמח לשמוע. אם נתקלתם בקושי בגלישה או בביצוע פעולה באתר, פנו אלינו ונטפל בפנייה בהקדם
              האפשרי. כדי שנוכל לסייע במהירות, ציינו את כתובת העמוד, את תיאור הבעיה ואת סוג הטכנולוגיה
              המסייעת שבה אתם משתמשים.
            </p>
            <h3>רכז הנגישות</h3>
            <ul>
              <li>
                טלפון:{' '}
                <a href={`tel:${business.phoneDial}`} dir="ltr">{business.phone}</a>
              </li>
              <li>
                דוא"ל:{' '}
                <a href={`mailto:${business.email}`} dir="ltr">{business.email}</a>
              </li>
              <li>כתובת: {fullAddress}</li>
            </ul>
          </section>
        </article>
      </div>
    </div>
  );
}
