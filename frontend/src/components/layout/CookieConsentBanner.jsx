import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { readConsent, storeConsent } from '../../utils/cookieConsent';
import styles from './CookieConsentBanner.module.css';

/**
 * Cookie consent gate — see docs/specs/10-legal-and-compliance.md §13.3.
 * Read the stored choice with `hasAnalyticsConsent()` before loading any
 * tracking script.
 */
export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(() => !readConsent());

  // Lifts the floating accessibility / contact buttons clear of the banner.
  useEffect(() => {
    document.documentElement.toggleAttribute('data-cookie-banner', visible);
    return () => document.documentElement.removeAttribute('data-cookie-banner');
  }, [visible]);

  function decide(choice) {
    storeConsent(choice);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className={styles.banner} role="dialog" aria-label="הודעה על שימוש בעוגיות">
      <div className={styles.text}>
        <h2 className={styles.title}>אנחנו משתמשים בעוגיות</h2>
        <p>
          עוגיות הכרחיות מפעילות את סל הקניות ואת אזור החשבון. בנוסף נשמח להשתמש בעוגיות מדידה כדי
          לשפר את האתר — אך רק באישורכם. פרטים מלאים ב
          <Link to="/privacy-policy">מדיניות הפרטיות</Link>.
        </p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.decline} onClick={() => decide('declined')}>
          רק ההכרחיות
        </button>
        <button type="button" className={styles.accept} onClick={() => decide('accepted')}>
          אישור הכל
        </button>
      </div>
    </div>
  );
}
