import { useState } from 'react';
import { productImageSrc, handleImageError } from '../../utils/productImage';
import styles from './ProductGallery.module.css';

export default function ProductGallery({ images = [], name }) {
  const [active, setActive] = useState(0);

  const gallery = images.length ? images : [productImageSrc(null)];

  return (
    <div className={styles.gallery}>
      <img
        src={productImageSrc(gallery[active])}
        alt={name}
        className={styles.main}
        onError={handleImageError}
      />
      {gallery.length > 1 && (
        <div className={styles.thumbs}>
          {gallery.map((image, index) => (
            <button
              key={image}
              type="button"
              aria-label={`הצגת תמונה ${index + 1} מתוך ${gallery.length}`}
              aria-current={index === active}
              className={index === active ? styles.activeThumb : styles.thumb}
              onClick={() => setActive(index)}
            >
              <img src={productImageSrc(image)} alt="" loading="lazy" onError={handleImageError} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
