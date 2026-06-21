import Button from '../components/ui/Button';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={`container ${styles.page}`}>
      <h1>הדף לא נמצא</h1>
      <p>נראה שהקישור שלחצת עליו שגוי או שהמוצר אינו קיים יותר</p>
      <Button href="/">חזרה לדף הבית</Button>
    </div>
  );
}
