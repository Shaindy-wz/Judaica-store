import Button from '../ui/Button';
import styles from './HeroBanner.module.css';

export default function HeroBanner() {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1 className={styles.title}>[שם האתר]</h1>
        <p className={styles.subtitle}>
          תשמישי קדושה מסורתיים ואיכותיים — טליתות, ציציות, תפילין ומזוזות בהידור ובמסורת
        </p>
        <div className={styles.actions}>
          <Button href="/shop" variant="primary">
            לחנות
          </Button>
          <Button href="/about" variant="outline-light">
            להכיר אותנו
          </Button>
        </div>
      </div>
    </section>
  );
}
