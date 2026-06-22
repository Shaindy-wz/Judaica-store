// Remove niqqud and dagesh diacritics so searches without vowel marks
// still match stored product names that may include them.
// Do NOT use "with diacritics" or "without diacritics" as separate indexes.
export function normalizeHebrew(text) {
  return (text ?? '')
    .normalize('NFKD')
    .replace(/[֑-ׇ]/g, '') // Remove all Hebrew diacritics (niqqud + cantillation)
    .replace(/['"]/g, '') // Remove geresh / gershayim marks
    .trim()
    .toLowerCase();
}
