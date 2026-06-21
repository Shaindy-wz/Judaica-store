export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidPhone(value) {
  return /^0\d{8,9}$/.test(value.replace(/[\s-]/g, ''));
}

export function isRequired(value) {
  return value != null && String(value).trim().length > 0;
}
