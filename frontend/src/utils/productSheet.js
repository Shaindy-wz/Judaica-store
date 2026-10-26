// Product spreadsheet format shared by import, export and the template
// (spec 12-admin-panel.md §Product import/export). One row per product, or one
// row per combination for a product with options; rows sharing a name are one
// product. The server validates every value — this file only maps columns.

const OPTION_SLOTS = 3;
// Byte-order mark: tells Excel the CSV is UTF-8, so Hebrew is not garbled.
const BOM = String.fromCharCode(0xfeff);
const BOM_AT_START = new RegExp(`^${BOM}`);

const COLUMNS = [
  { key: 'name', label: 'שם מוצר *' },
  { key: 'sku', label: 'מק"ט' },
  { key: 'category', label: 'קטגוריה' },
  { key: 'price', label: 'מחיר *' },
  { key: 'originalPrice', label: 'מחיר לפני הנחה' },
  ...Array.from({ length: OPTION_SLOTS }, (_, i) => [
    { key: `option${i + 1}Name`, label: `אפשרות ${i + 1} - שם` },
    { key: `option${i + 1}Value`, label: `אפשרות ${i + 1} - ערך` },
  ]).flat(),
  { key: 'stockQuantity', label: 'כמות במלאי' },
  { key: 'inStock', label: 'במלאי' },
  { key: 'description', label: 'תיאור' },
  { key: 'badge', label: 'תג' },
  { key: 'tags', label: 'תגיות' },
  { key: 'featured', label: 'מומלץ' },
  { key: 'images', label: 'תמונות' },
  { key: 'material', label: 'חומר' },
  { key: 'kashrut', label: 'כשרות' },
  { key: 'hashgacha', label: 'הכשר' },
  { key: 'tradition', label: 'עדה/מסורת' },
  { key: 'craftsmanship', label: 'אומנות' },
  { key: 'returnable', label: 'ניתן להחזרה' },
  { key: 'customizable', label: 'מותאם אישית' },
  { key: 'nonReturnableReason', label: 'סיבת אי-החזרה' },
  { key: 'metaTitle', label: 'כותרת SEO' },
  { key: 'metaDescription', label: 'תיאור SEO' },
];

// Header matching ignores the "*" marker, quote styles (מק"ט / מק״ט) and spacing.
const normalizeHeader = (h) =>
  String(h ?? '').replace(/[*"'״׳]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
const COLUMN_BY_HEADER = new Map(COLUMNS.map((c) => [normalizeHeader(c.label), c.key]));

const TEMPLATE_ROWS = [
  {
    name: 'דוגמה - מזוזה מעץ זית', sku: 'MZ-100', category: 'מזוזות', price: '180',
    stockQuantity: '12', inStock: 'כן', description: 'בית מזוזה בעבודת יד', badge: 'חדש',
    tags: 'מתנה, עץ', featured: 'לא', material: 'עץ זית', returnable: 'כן',
  },
  {
    name: 'דוגמה - טלית צמר', sku: 'TZ-50', category: 'טליתות', price: '299', originalPrice: '349',
    option1Name: 'מידה', option1Value: '50', stockQuantity: '5', inStock: 'כן',
    description: 'טלית צמר מהודרת', kashrut: 'מהודר', returnable: 'לא',
    nonReturnableReason: 'תשמיש קדושה',
  },
  { name: 'דוגמה - טלית צמר', sku: 'TZ-60', price: '349', option1Name: 'מידה', option1Value: '60', stockQuantity: '0', inStock: 'לא' },
];

// ---------- CSV ----------

function toCsv(rows) {
  const cell = (value) => {
    const s = value == null ? '' : String(value);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [COLUMNS.map((c) => cell(c.label)).join(',')];
  for (const row of rows) lines.push(COLUMNS.map((c) => cell(row[c.key])).join(','));
  return `${BOM}${lines.join('\r\n')}\r\n`;
}

function parseCsv(textContent) {
  const content = textContent.replace(BOM_AT_START, '');
  const firstLine = content.split(/\r?\n/, 1)[0];
  // Excel saves with ";" or tab in some regional settings.
  const delimiter = [',', ';', '\t'].reduce((best, d) =>
    firstLine.split(d).length > firstLine.split(best).length ? d : best, ',');

  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (quoted) {
      if (ch === '"' && content[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && content[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Excel's plain "CSV" option saves Hebrew as Windows-1255, not UTF-8.
function decode(buffer) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder('windows-1255').decode(buffer);
  }
}

// ---------- Reading an uploaded file ----------

/**
 * Reads a .csv or .xlsx file into rows for POST /api/admin/products/import.
 * Returns { rows, unknownHeaders } or throws an Error with a Hebrew message.
 */
export async function readProductSheet(file) {
  let table;
  if (/\.xlsx$/i.test(file.name)) {
    const { default: readXlsxFile } = await import('read-excel-file');
    table = await readXlsxFile(file);
  } else if (/\.(csv|txt)$/i.test(file.name)) {
    table = parseCsv(decode(await file.arrayBuffer()));
  } else {
    throw new Error('יש לבחור קובץ Excel (.xlsx) או CSV. קובץ .xls ישן יש לשמור קודם כ-.xlsx');
  }

  const [header = [], ...body] = table;
  const keys = header.map((h) => COLUMN_BY_HEADER.get(normalizeHeader(h)));
  const unknownHeaders = header.filter((h, i) => !keys[i] && String(h ?? '').trim()).map(String);
  if (!keys.includes('name') || !keys.includes('price')) {
    throw new Error('בשורה הראשונה של הקובץ חייבות להופיע העמודות "שם מוצר" ו"מחיר". מומלץ להתחיל מקובץ התבנית');
  }

  const rows = [];
  body.forEach((cells, index) => {
    const values = {};
    keys.forEach((k, i) => {
      if (!k) return;
      const v = cells[i];
      values[k] = v instanceof Date ? v.toISOString().slice(0, 10) : v == null ? '' : String(v).trim();
    });
    if (!Object.values(values).some(Boolean)) return; // blank line

    const options = [];
    for (let n = 1; n <= OPTION_SLOTS; n++) {
      options.push({ name: values[`option${n}Name`] ?? '', value: values[`option${n}Value`] ?? '' });
      delete values[`option${n}Name`];
      delete values[`option${n}Value`];
    }
    rows.push({ ...values, options, row: index + 2 }); // +2: 1-based, after the header
  });

  if (!rows.length) throw new Error('לא נמצאו שורות מוצרים בקובץ');
  return { rows, unknownHeaders };
}

// ---------- Export & template ----------

const yesNo = (value) => (value === undefined || value === null ? '' : value ? 'כן' : 'לא');

function categoryPaths(tree) {
  const paths = new Map();
  for (const parent of tree) {
    paths.set(parent._id, parent.name);
    for (const child of parent.children ?? []) paths.set(child._id, `${parent.name} > ${child.name}`);
  }
  return paths;
}

function productToRows(p, paths) {
  const categoryId = p.category?._id ?? p.category;
  const shared = {
    name: p.name,
    category: paths.get(categoryId) ?? '',
    originalPrice: p.originalPrice ?? '',
    description: p.description ?? '',
    badge: p.badge ?? '',
    tags: (p.tags ?? []).join(', '),
    featured: yesNo(p.featured),
    images: (p.images ?? []).join(' '),
    material: p.specs?.material ?? '',
    kashrut: p.specs?.kashrut ?? '',
    hashgacha: p.specs?.hashgacha ?? '',
    tradition: p.specs?.tradition ?? '',
    craftsmanship: p.specs?.craftsmanship ?? '',
    returnable: yesNo(p.returnPolicy?.returnable),
    customizable: yesNo(p.returnPolicy?.customizable),
    nonReturnableReason: p.returnPolicy?.nonReturnableReason ?? '',
    metaTitle: p.seo?.metaTitle ?? '',
    metaDescription: p.seo?.metaDescription ?? '',
  };

  if (!(p.variants?.length > 1)) {
    return [{
      ...shared,
      sku: p.sku ?? '',
      price: p.basePrice,
      stockQuantity: p.stockQuantity ?? '',
      inStock: yesNo(p.inStock),
    }];
  }

  // Shared details on the first row only keeps the sheet readable; the
  // importer takes them from whichever row of the product has them.
  return p.variants.map((v, i) => {
    const row = {
      ...(i === 0 ? shared : { name: p.name }),
      sku: v.sku ?? '',
      price: v.price,
      stockQuantity: v.stockQuantity ?? '',
      inStock: yesNo(v.inStock),
    };
    Object.entries(v.optionValues ?? {}).slice(0, OPTION_SLOTS).forEach(([name, value], n) => {
      row[`option${n + 1}Name`] = name;
      row[`option${n + 1}Value`] = value;
    });
    return row;
  });
}

function download(filename, content) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadTemplate() {
  download('תבנית-ייבוא-מוצרים.csv', toCsv(TEMPLATE_ROWS));
}

export function downloadProducts(products, categoryTree) {
  const paths = categoryPaths(categoryTree);
  const date = new Date().toISOString().slice(0, 10);
  download(`מוצרים-${date}.csv`, toCsv(products.flatMap((p) => productToRows(p, paths))));
}
