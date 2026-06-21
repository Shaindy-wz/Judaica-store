import styles from './PromoStrip.module.css';

const promos = ['משלוח חינם מ-₪249', 'אריזה מהודרת', 'תשלום מאובטח'];

export default function PromoStrip() {
  return (
    <div className={styles.strip}>
      {promos.map((promo) => (
        <span key={promo} className={styles.item}>
          {promo}
        </span>
      ))}
    </div>
  );
}
