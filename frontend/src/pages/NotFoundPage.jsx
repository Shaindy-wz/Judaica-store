import Button from '../components/ui/Button';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={`container ${styles.page}`}>
      <span className={styles.code} aria-hidden="true">404</span>
      <h1 className={styles.title}>הדף לא נמצא</h1>
      <p className={styles.text}>נראה שהקישור שלחצת עליו שגוי או שהמוצר אינו קיים יותר</p>
      <Button href="/">חזרה לדף הבית</Button>
    </div>
  );
}
