/**
 * A product without a usable image should still render as a finished card,
 * never as a broken-image icon.
 */
export const PRODUCT_IMAGE_PLACEHOLDER = '/images/product-placeholder.svg';

/** Use for the initial `src`. */
export function productImageSrc(image) {
  return image || PRODUCT_IMAGE_PLACEHOLDER;
}

/** Use as the `onError` handler — swaps in the placeholder once, without looping. */
export function handleImageError(event) {
  if (event.currentTarget.src.endsWith(PRODUCT_IMAGE_PLACEHOLDER)) return;
  event.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER;
}
