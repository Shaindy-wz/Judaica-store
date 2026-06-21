import { useState } from 'react';
import styles from './ProductGallery.module.css';

export default function ProductGallery({ images = [], name }) {
  const [active, setActive] = useState(0);

  if (!images.length) return <div className={styles.placeholder} />;

  return (
    <div className={styles.gallery}>
      <img src={images[active]} alt={name} className={styles.main} />
      {images.length > 1 && (
        <div className={styles.thumbs}>
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              className={index === active ? styles.activeThumb : styles.thumb}
              onClick={() => setActive(index)}
            >
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
