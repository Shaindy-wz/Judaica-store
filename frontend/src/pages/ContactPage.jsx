import { useState } from 'react';
import Breadcrumb from '../components/ui/Breadcrumb';
import business, { fullAddress, whatsappUrl } from '../config/business';
import content from './ContentPage.module.css';
import styles from './ContactPage.module.css';

const SUBJECTS = [
  'שאלה על מוצר',
  'מעקב אחר הזמנה',
  'החזרה או החלפה',
  'הזמנה מיוחדת / כמויות',
  'אחר',
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
  const [sent, setSent] = useState(false);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // No contact-form API endpoint exists yet, so the form opens the visitor's own
  // mail client with everything pre-filled — a real, working way to reach us.
  function handleSubmit(event) {
    event.preventDefault();
    const body = [
      `שם: ${form.name}`,
      `דוא"ל: ${form.email}`,
      `טלפון: ${form.phone || '—'}`,
      '',
      form.message,
    ].join('\n');

    window.location.href =
      `mailto:${business.email}` +
      `?subject=${encodeURIComponent(`[אתר] ${form.subject}`)}` +
      `&body=${encodeURIComponent(body)}`;

    setSent(true);
  }

  return (
    <div className={content.page}>
      <div className={content.banner}>
        <span className={content.eyebrow}>נשמח לשמוע מכם</span>
        <h1 className={content.bannerTitle}>צור קשר</h1>
        <p className={content.bannerText}>
          צוות השירות שלנו כאן כדי לעזור בבחירת תשמישי הקדושה, במעקב אחר הזמנה ובכל שאלה אחרת.
        </p>
      </div>

      <div className="container">
        <Breadcrumb items={[{ label: 'דף הבית', href: '/' }, { label: 'צור קשר' }]} />

        <div className={styles.methods}>
          <a className={styles.card} href={`tel:${business.phoneDial}`}>
            <span className={styles.icon} aria-hidden="true">📞</span>
            <span className={styles.cardTitle}>טלפון</span>
            <span className={styles.cardValue} dir="ltr">{business.phone}</span>
            <span className={styles.cardHint}>שיחה ישירה עם נציג שירות</span>
          </a>

          <a className={styles.card} href={`mailto:${business.email}`}>
            <span className={styles.icon} aria-hidden="true">✉️</span>
            <span className={styles.cardTitle}>דוא"ל</span>
            <span className={styles.cardValue} dir="ltr">{business.email}</span>
            <span className={styles.cardHint}>מענה תוך יום עסקים אחד</span>
          </a>

          {whatsappUrl && (
            <a className={styles.card} href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <span className={styles.icon} aria-hidden="true">💬</span>
              <span className={styles.cardTitle}>וואטסאפ</span>
              <span className={styles.cardValue}>שלחו לנו הודעה</span>
              <span className={styles.cardHint}>נוח לשאלות קצרות ולתמונות</span>
            </a>
          )}

          <div className={styles.card}>
            <span className={styles.icon} aria-hidden="true">📍</span>
            <span className={styles.cardTitle}>כתובת</span>
            <span className={styles.cardValue}>{fullAddress}</span>
            <span className={styles.cardHint}>איסוף עצמי בתיאום מראש</span>
          </div>
        </div>

        <div className={styles.layout}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <h2 className={styles.formTitle}>השאירו הודעה</h2>
            <p className={styles.formLead}>
              מילוי הטופס יפתח הודעת דוא"ל מוכנה לשליחה אלינו, עם כל הפרטים שהזנתם.
            </p>

            <div className={styles.field}>
              <label htmlFor="contact-name">שם מלא *</label>
              <input
                id="contact-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="ישראל ישראלי"
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="contact-email">דוא"ל *</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  dir="ltr"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="contact-phone">טלפון</label>
                <input
                  id="contact-phone"
                  type="tel"
                  dir="ltr"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="050-0000000"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="contact-subject">נושא הפנייה</label>
              <select
                id="contact-subject"
                value={form.subject}
                onChange={(e) => setField('subject', e.target.value)}
              >
                {SUBJECTS.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="contact-message">ההודעה שלכם *</label>
              <textarea
                id="contact-message"
                rows={6}
                required
                value={form.message}
                onChange={(e) => setField('message', e.target.value)}
                placeholder="כתבו כאן את פנייתכם…"
              />
            </div>

            <button type="submit" className={styles.submit}>שליחת הודעה</button>

            {sent && (
              <p className={styles.sent} role="status">
                נפתחה עבורכם הודעת דוא"ל מוכנה לשליחה. אם היא לא נפתחה, ניתן לכתוב לנו ישירות אל{' '}
                <a href={`mailto:${business.email}`} dir="ltr">{business.email}</a>.
              </p>
            )}
          </form>

          <aside className={styles.hours}>
            <h2 className={styles.formTitle}>שעות פעילות</h2>
            <dl className={styles.hoursList}>
              {business.hours.map((entry) => (
                <div key={entry.days} className={styles.hoursRow}>
                  <dt>{entry.days}</dt>
                  <dd>{entry.time}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.note}>
              בערבי חג ובחול המועד ייתכנו שינויים בשעות הפעילות. בקשות שנשלחות בדוא"ל מחוץ לשעות
              הפעילות ייענו ביום העסקים הקרוב.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
