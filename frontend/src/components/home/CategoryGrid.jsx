import { Link } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import styles from './CategoryGrid.module.css';

export default function CategoryGrid() {
  const { categories, loading } = useCategories();

  if (loading) return null;

  return (
    <section className={styles.section}>
      <h2 className="section-title">קטגוריות</h2>
      <div className={styles.items}>
        {categories
          .filter((category) => !category.parent)
          .map((category) => (
            <Link key={category._id} to={`/category/${category.slug}`} className={styles.card}>
              {category.image && <img src={category.image} alt={category.name} />}
              <span className={styles.name}>{category.name}</span>
            </Link>
          ))}
      </div>
    </section>
  );
}
