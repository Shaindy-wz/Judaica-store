import { Link } from 'react-router-dom';
import { whatsappUrl } from '../../config/business';
import styles from './WhatsAppButton.module.css';

/**
 * Floating contact button. Until the business WhatsApp number is filled in
 * (see config/business.js) it links to the contact page, so it never produces
 * a dead wa.me link.
 */
export default function WhatsAppButton() {
  if (!whatsappUrl) {
    return (
      <Link to="/contact" className={`${styles.button} ${styles.contact}`}>
        <span aria-hidden="true">✉️</span>
        <span>צרו איתנו קשר</span>
      </Link>
    );
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.button}
    >
      <span aria-hidden="true">💬</span>
      <span>דברו איתנו בוואטסאפ</span>
    </a>
  );
}
