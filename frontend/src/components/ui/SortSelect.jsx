import styles from './SortSelect.module.css';

const SORT_OPTIONS = [
  { value: '', label: 'מומלצים' },
  { value: 'newest', label: 'חדש ביותר' },
  { value: 'price_asc', label: 'מחיר: מהנמוך לגבוה' },
  { value: 'price_desc', label: 'מחיר: מהגבוה לנמוך' },
];

export default function SortSelect({ value, onChange }) {
  return (
    <label className={styles.wrapper}>
      <span className={styles.label}>מיון:</span>
      <select
        className={styles.select}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        aria-label="מיין מוצרים"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
