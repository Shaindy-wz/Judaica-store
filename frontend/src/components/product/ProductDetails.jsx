import { useState } from 'react';
import ProductPriceRange from './ProductPriceRange';
import ProductOptions from './ProductOptions';
import InventoryStatus from './InventoryStatus';
import AddToCartButton from './AddToCartButton';
import styles from './ProductDetails.module.css';

export default function ProductDetails({ product }) {
  const [selected, setSelected] = useState({});
  const [matchedVariant, setMatchedVariant] = useState(null);

  const hasVariants = product.variants?.length > 1;
  const priceRange = product.priceRange ?? { min: product.basePrice, max: product.basePrice };
  const activePrice = matchedVariant?.price ?? priceRange.min;

  const requiresSelection = hasVariants && !matchedVariant;
  const inStock = hasVariants ? (matchedVariant?.inStock ?? true) : product.inStock;
  const stockQuantity = hasVariants ? matchedVariant?.stockQuantity : undefined;
  const canAddToCart = !requiresSelection && inStock;

  return (
    <div className={styles.details}>
      <h1 className={styles.name}>{product.name}</h1>
      <ProductPriceRange
        price={activePrice}
        maxPrice={!matchedVariant && hasVariants ? priceRange.max : undefined}
        originalPrice={product.originalPrice}
      />
      {hasVariants && (
        <ProductOptions
          options={product.options}
          variants={product.variants}
          selected={selected}
          onChange={(nextSelected, variant) => {
            setSelected(nextSelected);
            setMatchedVariant(variant);
          }}
        />
      )}
      <InventoryStatus
        inStock={inStock}
        stockQuantity={stockQuantity}
        requiresSelection={requiresSelection}
      />
      <AddToCartButton product={product} variant={matchedVariant} disabled={!canAddToCart} />
      {product.description && <p className={styles.description}>{product.description}</p>}
      {product.specs && (
        <dl className={styles.specs}>
          {Object.entries(product.specs)
            .filter(([, value]) => value)
            .map(([key, value]) => (
              <div key={key} className={styles.specRow}>
                <dt>{specLabels[key] ?? key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
        </dl>
      )}
    </div>
  );
}

const specLabels = {
  material: 'חומר',
  kashrut: 'כשרות',
  hashgacha: 'השגחה',
  tradition: 'מסורת',
  craftsmanship: 'אופן ייצור',
};
