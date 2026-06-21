export function formatPrice(value) {
  return `₪${Number(value).toLocaleString('he-IL')}`;
}
