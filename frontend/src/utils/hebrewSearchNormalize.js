export function normalizeHebrew(text) {
  return text
    .normalize('NFKD')
    .replace(/[֑-ׇ]/g, '')
    .replace(/['"]/g, '')
    .trim()
    .toLowerCase();
}
