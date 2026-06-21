import styles from './WhatsAppButton.module.css';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/972XXXXXXXXX"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.button}
    >
      <span aria-hidden="true">💬</span>
      <span>דברו איתנו בוואטסאפ</span>
    </a>
  );
}
