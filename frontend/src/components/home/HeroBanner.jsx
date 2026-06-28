import Button from '../ui/Button';
import styles from './HeroBanner.module.css';

export default function HeroBanner() {
  return (
    <section className={styles.hero}>
      <p className={styles.watermark} aria-hidden="true">פארך</p>

      <div className={styles.content}>
        <p className={styles.eyebrow}>תשמישי קדושה מהודרים</p>
        <h1 className={styles.title}>פארך</h1>
        <p className={styles.subtitle}>
          תשמישי קדושה מסורתיים ואיכותיים — טליתות, ציציות, תפילין ומזוזות בהידור ובמסורת
        </p>
        <div className={styles.actions}>
          <Button href="/shop" variant="gold">
            לחנות
          </Button>
          <Button href="/about" variant="outline-light">
            להכיר אותנו
          </Button>
        </div>
      </div>

      <div className={styles.visual} aria-hidden="true">
        <span className={styles.ring} />
        <span className={styles.ring2} />
        <img src="/images/logo-emblem.png" alt="" className={styles.emblem} />
      </div>
    </section>
  );
}
