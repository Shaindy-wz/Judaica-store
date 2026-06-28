import styles from './ProductFilters.module.css';

export default function ProductFilters({ subCategories, minPrice, maxPrice, onChange }) {
  return (
    <aside className={styles.sidebar}>
      {subCategories?.length > 0 && (
        <div className={styles.block}>
          <h3>קטגוריות משנה</h3>
          <ul>
            {subCategories.map((sub) => (
              <li key={sub._id}>
                <a href={`/category/${sub.slug}`}>{sub.name}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className={styles.block}>
        <h3>טווח מחירים</h3>
        <div className={styles.priceInputs}>
          <input
            type="number"
            placeholder="מ-"
            aria-label="מחיר מינימום"
            value={minPrice}
            onChange={(e) => onChange('minPrice', e.target.value)}
          />
          <input
            type="number"
            placeholder="עד"
            aria-label="מחיר מקסימום"
            value={maxPrice}
            onChange={(e) => onChange('maxPrice', e.target.value)}
          />
        </div>
      </div>
    </aside>
  );
}
