// Product spreadsheet import/export (spec 12-admin-panel.md §Product import/export).
//
// The store's workbook has three sheets:
//   "מוצרים"        — one row per colour/size of a product (SKU, name, the
//                      option columns, price)
//   "נתוני עזר"     — the colour list behind the sheet's drop-downs (ignored on import)
//   "מלאי ומוצרים"  — one row per product: SKU, name, material, size,
//                      category, consumer price, sale price, paid add-ons and
//                      their extra price
// Sheets are recognised by their headers, not their names or order, and a
// single-sheet CSV of either kind also works.
//
// Everything is converted here into the flat rows POST /api/admin/products/import
// takes — one row per purchasable combination — and the server validates them.
// Paid add-ons become yes/no options ("רקמת שם": לא / כן) whose "כן" variants
// cost the extra price, so they work with the existing variant system.

import { readEmbeddedImages } from './sheetImages.js';

const SHEET_VARIANTS = 'מוצרים';
const SHEET_HELPER = 'נתוני עזר';
const SHEET_CATALOG = 'מלאי ומוצרים';

const YES = 'כן';
const NO = 'לא';
const MAX_ADDONS = 4; // each add-on doubles the combinations
const COLOUR_COLUMN = 'צבע/חומר';
const SIZE_COLUMN = 'מידה';

const CATALOG_COLUMNS = [
  { key: 'sku', label: 'מק"ט (SKU)' },
  { key: 'name', label: 'שם המוצר' },
  { key: 'material', label: 'חומר' },
  { key: 'size', label: 'גודל' },
  { key: 'category', label: 'קטגוריה' },
  { key: 'consumerPrice', label: 'מחיר לצרכן' },
  { key: 'salePrice', label: 'מחיר מבצע' },
  { key: 'addons', label: 'אפשרויות' },
  { key: 'addonPrices', label: 'מחיר תוספת' },
  { key: 'images', label: 'תמונות' },
];

// Header text → field. Matching ignores quote styles, brackets, "*", spacing
// and a currency mark ("מחיר (₪)", "מחיר בש"ח" are both "מחיר").
const normalizeHeader = (h) =>
  String(h ?? '').replace(/[*"'״׳()[\]:₪]/g, '').replace(/(^|\s)ב?שח(?=\s|$)/g, ' ')
    .replace(/\s+/g, ' ').trim().toLowerCase();
const FIELD_BY_HEADER = new Map(Object.entries({
  'מקט': 'sku', 'מקט sku': 'sku', 'sku': 'sku', 'ברקוד': 'sku', 'קוד מוצר': 'sku', 'מספר קטלוגי': 'sku',
  'שם המוצר': 'name', 'שם מוצר': 'name', 'מוצר': 'name', 'שם פריט': 'name', 'פריט': 'name',
  'product': 'name', 'product name': 'name',
  'קטגוריה': 'category', 'קטגוריית מוצר': 'category', 'category': 'category',
  'מחיר לצרכן': 'consumerPrice', 'מחיר': 'price', 'price': 'price', 'מחיר מבצע': 'salePrice',
  'מחיר לפני הנחה': 'originalPrice',
  'אפשרויות': 'addons', 'מחיר תוספת': 'addonPrices',
  'חומר': 'material', 'גודל': 'size',
  'כמות במלאי': 'stockQuantity', 'מלאי': 'stockQuantity', 'כמות': 'stockQuantity',
  'במלאי': 'inStock',
  'תיאור': 'description', 'תג': 'badge', 'תגיות': 'tags', 'מומלץ': 'featured',
  'תמונות': 'images', 'תמונה': 'images', 'תמונה ראשית': 'images', 'תמונת מוצר': 'images', 'תמונות מוצר': 'images',
  'קישור תמונה': 'images', 'קישור לתמונה': 'images', 'קישורי תמונות': 'images', 'קישורים לתמונות': 'images',
  'image': 'images', 'images': 'images', 'picture': 'images', 'photo': 'images',
  'כשרות': 'kashrut', 'הכשר': 'hashgacha', 'עדה/מסורת': 'tradition', 'אומנות': 'craftsmanship',
  'ניתן להחזרה': 'returnable', 'מותאם אישית': 'customizable', 'סיבת אי-החזרה': 'nonReturnableReason',
  'כותרת seo': 'metaTitle', 'תיאור seo': 'metaDescription',
}));
// The earlier one-sheet format: "אפשרות 1 - שם" / "אפשרות 1 - ערך".
const OPTION_SLOT = /^אפשרות (\d+) - (שם|ערך)$/;
// Columns only the per-product sheet has ("גודל" is not one: it can be an option column too).
const CATALOG_ONLY = new Set(['category', 'consumerPrice', 'salePrice', 'addons', 'addonPrices']);
// In the per-colour sheet these are fields; every other column is an option (צבע/חומר, מידה...).
const VARIANT_FIELDS = new Set(['sku', 'name', 'price', 'consumerPrice', 'stockQuantity', 'inStock']);
// Product-level fields passed through to the server unchanged.
const SHARED_FIELDS = [
  'category', 'description', 'badge', 'tags', 'featured', 'images', 'material', 'kashrut', 'hashgacha',
  'tradition', 'craftsmanship', 'returnable', 'customizable', 'nonReturnableReason', 'metaTitle',
  'metaDescription', 'originalPrice',
];
// Product-level columns that are never an option, so the per-colour sheet may
// carry them too (e.g. "תמונות"). "חומר" is left out: there it is an option column.
for (const field of SHARED_FIELDS) if (field !== 'material') VARIANT_FIELDS.add(field);

const key = (value) => String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
const PLACEHOLDER = /^[-–—]+$/;
const splitList = (value) => String(value ?? '').split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
const toNumber = (value) => {
  const n = Number(String(value ?? '').replace(/[₪\s,]/g, ''));
  return String(value ?? '').trim() && Number.isFinite(n) ? n : null;
};

// Byte-order mark: Excel needs it to open a UTF-8 CSV with Hebrew intact.
const BOM_AT_START = new RegExp(`^${String.fromCharCode(0xfeff)}`);

// ---------- Reading ----------

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

// Excel's error values (an in-cell picture reads as one in some versions).
const EXCEL_ERROR = /^#(VALUE|N\/A|REF|NAME|NULL|NUM|DIV\/0|SPILL|CALC|BLOCKED|FIELD|UNKNOWN|CONNECT|BUSY)[!?]?$/i;
const SPREADSHEET = /\.(xlsx|xlsm|xltx|xltm|xlsb|xls|xlt|ods|fods|numbers)$/i;
const ZIP_BASED = /\.(xlsx|xlsm|xltx|xltm)$/i;
// Formula =IMAGE("https://...") shows a web picture in the cell; its link is
// read as one of that row's images.
const IMAGE_FORMULA = /^_?(?:xlfn\.)?IMAGE\(\s*"([^"]+)"/i;

// Excel stores 12.3 as 12.299999999999999 after some formulas.
const tidyNumber = (n) => (typeof n === 'number' && Number.isFinite(n) && !Number.isInteger(n)
  ? parseFloat(n.toPrecision(12)) : n);

async function readFileBytes(file) {
  try {
    return new Uint8Array(await file.arrayBuffer());
  } catch {
    throw new Error(`לא ניתן לקרוא את הקובץ "${file.name}". אם הוא פתוח ב-Excel — יש לסגור אותו ולבחור אותו שוב.`);
  }
}

// Every sheet as rows of cells, plus the pictures inside the workbook.
// Any Excel format opens (xlsx, old xls, xlsm, ods...); CSV is parsed here.
async function readTables(file) {
  if (/\.(csv|txt|tsv)$/i.test(file.name) || file.type === 'text/csv') {
    const rows = parseCsv(decode(await readFileBytes(file)));
    return { tables: [{ name: file.name, firstRow: 1, rows }], images: new Map() };
  }
  if (!SPREADSHEET.test(file.name) && !/spreadsheet|excel/i.test(file.type)) {
    throw new Error(`הקובץ "${file.name}" אינו קובץ Excel. יש לבחור קובץ Excel (xlsx / xls) או CSV.`);
  }

  const data = await readFileBytes(file);
  const XLSX = await import('xlsx');
  let workbook;
  try {
    workbook = XLSX.read(data, { type: 'array', cellDates: true, cellFormula: true });
  } catch (e) {
    if (/password|encrypt/i.test(e?.message ?? '')) {
      throw new Error('הקובץ מוגן בסיסמה. יש להסיר את הסיסמה ב-Excel ולשמור שוב.', { cause: e });
    }
    throw new Error(`לא הצלחנו לפתוח את "${file.name}". יש לפתוח אותו ב-Excel, לשמור בשם (Save As) כ"חוברת עבודה של Excel (‎.xlsx)" ולנסות שוב.`, { cause: e });
  }

  const images = ZIP_BASED.test(file.name) ? readEmbeddedImages(XLSX, data) : new Map();
  const tables = workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    const range = sheet['!ref'] ? XLSX.utils.decode_range(sheet['!ref']) : null;
    for (const [address, cell] of Object.entries(sheet)) {
      const link = address[0] !== '!' && typeof cell?.f === 'string' && cell.f.match(IMAGE_FORMULA)?.[1];
      if (!link) continue;
      const { r, c } = XLSX.utils.decode_cell(address);
      if (!images.has(name)) images.set(name, []);
      images.get(name).push({ row: r + 1, lastRow: r + 1, col: c + 1, url: link });
      Object.assign(cell, { t: 's', v: '', w: '' });
    }
    const rows = range
      ? XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: '', blankrows: true })
        .map((cells) => cells.map(tidyNumber))
      : [];
    return { name, firstRow: range ? range.s.r + 1 : 1, rows };
  });
  return { tables, images };
}

const cellText = (v) => {
  const s = v instanceof Date ? v.toISOString().slice(0, 10) : v == null ? '' : String(v).trim();
  return PLACEHOLDER.test(s) || EXCEL_ERROR.test(s) ? '' : s;
};

// Classifies one sheet and turns its rows into records.
function readTable(table, labelRow, unknownHeaders, sheetImages = []) {
  const headerIndex = table.rows.slice(0, 5).findIndex((cells) =>
    cells.some((h) => FIELD_BY_HEADER.get(normalizeHeader(h)) === 'name'));
  if (headerIndex === -1) return null; // e.g. the colour list in "נתוני עזר"

  const headers = table.rows[headerIndex].map((h) => String(h ?? '').trim());
  const fields = headers.map((h) => FIELD_BY_HEADER.get(normalizeHeader(h)));
  const slots = headers.map((h) => h.match(OPTION_SLOT));
  const kind = slots.some(Boolean) ? 'flat'
    : fields.some((f) => CATALOG_ONLY.has(f)) ? 'catalog'
      : 'variants';

  if (kind !== 'variants') {
    headers.forEach((h, i) => { if (h && !fields[i] && !slots[i]) unknownHeaders.add(h); });
  }

  const records = [];
  const recordAt = new Map();
  table.rows.slice(headerIndex + 1).forEach((cells, i) => {
    const rowNumber = table.firstRow + headerIndex + i + 1;
    const record = { ...labelRow(table.name, rowNumber), dims: [], slots: {}, media: [] };
    headers.forEach((h, c) => {
      const value = cellText(cells[c]);
      if (kind === 'variants' && !VARIANT_FIELDS.has(fields[c])) {
        if (h) record.dims.push({ name: h, value });
      } else if (slots[c]) {
        record.slots[`${slots[c][1]}-${slots[c][2]}`] = value;
      } else if (fields[c]) {
        record[fields[c]] = value;
      }
    });
    const hasData = record.name || record.sku || record.dims.some((d) => d.value) ||
      Object.values(record.slots).some(Boolean);
    if (hasData) {
      records.push(record);
      recordAt.set(rowNumber, record);
    }
  });

  // Each picture belongs to the product row it sits on (or overlaps).
  const headerRow = table.firstRow + headerIndex;
  const strayImages = [];
  for (const image of sheetImages) {
    let owner = null;
    for (let row = image.row; row <= image.lastRow && !owner; row++) owner = recordAt.get(row);
    if (owner) owner.media.push(image);
    else if (image.lastRow > headerRow) strayImages.push(image.row);
  }
  return { kind, records, strayImages };
}

/**
 * Reads the uploaded workbook (or CSV) into rows for
 * POST /api/admin/products/import. Returns { rows, unknownHeaders, errors, warnings }
 * — errors here are layout problems the server cannot see (e.g. add-on prices).
 */
export async function readProductSheet(file) {
  const { tables, images } = await readTables(file);
  const multiSheet = tables.length > 1;
  let nextId = 1;
  const labelRow = (sheet, rowNumber) => ({
    row: nextId++,
    label: multiSheet ? `${sheet}, שורה ${rowNumber}` : `שורה ${rowNumber}`,
  });

  const unknownHeaders = new Set();
  const errors = [];
  const warnings = [];
  const catalog = new Map();
  const variantsByName = new Map();
  const flatRows = [];
  const order = [];

  // Pictures, image links and picture file names, per product, in sheet order.
  // They are taken out of the rows: the import panel uploads the pictures and
  // puts the resulting links back (see resolveProductImages).
  const imagesByProduct = new Map();
  const collectImages = (record) => {
    const sources = [
      ...parseImageCell(record.images),
      ...record.media.map((m) => (m.url
        ? { kind: 'url', url: m.url }
        : { kind: 'embedded', key: m.key, name: m.name, type: m.type, bytes: m.bytes })),
    ];
    delete record.images;
    const k = key(record.name);
    if (!sources.length || !k) return;
    if (!imagesByProduct.has(k)) imagesByProduct.set(k, { name: record.name, label: record.label, sources: [] });
    imagesByProduct.get(k).sources.push(...sources);
  };

  for (const table of tables) {
    const sheet = readTable(table, labelRow, unknownHeaders, images.get(table.name));
    if (!sheet) continue;
    if (sheet.strayImages.length) {
      warnings.push({
        row: 0,
        label: table.name,
        message: `התמונות בשורות ${[...new Set(sheet.strayImages)].join(', ')} לא נמצאות בשורה של מוצר ולכן לא ייובאו`,
      });
    }
    for (const record of sheet.records) {
      collectImages(record);
      if (sheet.kind === 'flat') {
        const options = Object.entries(record.slots)
          .filter(([k]) => k.endsWith('-שם'))
          .map(([k, name]) => ({ name, value: record.slots[k.replace('-שם', '-ערך')] ?? '' }));
        flatRows.push({ ...record, options, slots: undefined, dims: undefined, media: undefined });
        continue;
      }
      const k = key(record.name);
      if (!k) {
        errors.push({ row: record.row, label: record.label, message: 'חסר שם מוצר' });
        continue;
      }
      if (!catalog.has(k) && !variantsByName.has(k)) order.push(k);
      if (sheet.kind === 'catalog') {
        if (catalog.has(k)) {
          errors.push({ row: record.row, label: record.label, message: `המוצר "${record.name}" מופיע פעמיים ברשימת המוצרים (גם ב${catalog.get(k).label})` });
        } else catalog.set(k, record);
      } else {
        if (!variantsByName.has(k)) variantsByName.set(k, []);
        variantsByName.get(k).push(record);
      }
    }
  }

  const rows = [...flatRows];
  for (const k of order) {
    const product = expandProduct(catalog.get(k), variantsByName.get(k) ?? []);
    rows.push(...product.rows);
    errors.push(...product.errors);
    warnings.push(...product.warnings);
  }

  if (!rows.length && !errors.length) {
    const firstRow = tables.flatMap((t) => t.rows.slice(0, 5))
      .find((cells) => cells.filter((c) => cellText(c)).length > 1);
    const seen = firstRow ? ` (בקובץ נמצאו העמודות: ${firstRow.map(cellText).filter(Boolean).join(', ')})` : '';
    throw new Error(`לא נמצאו מוצרים בקובץ. באחת מ-5 השורות הראשונות צריכה להיות שורת כותרות עם עמודה "שם המוצר"${seen}. הכי פשוט להתחיל מ"הורדת תבנית".`);
  }
  for (const product of imagesByProduct.values()) product.sources = uniqueSources(product.sources);
  return { rows, unknownHeaders: [...unknownHeaders], errors, warnings, imagesByProduct };
}

// ---------- Images ----------

const URL_LIKE = /^(https?:\/\/|\/\/|\/)/i;

// An images cell holds links and/or picture file names, separated by commas,
// semicolons, "|" or new lines. Links may also be separated by spaces.
export function parseImageCell(value) {
  const sources = [];
  for (const piece of String(value ?? '').split(/[\n,;|]+/).map((p) => p.trim()).filter(Boolean)) {
    const words = piece.split(/\s+/);
    const parts = words.length > 1 && words.every((w) => URL_LIKE.test(w)) ? words : [piece];
    for (const part of parts) {
      if (EXCEL_ERROR.test(part) || PLACEHOLDER.test(part)) continue;
      if (URL_LIKE.test(part)) sources.push({ kind: 'url', url: part.startsWith('//') ? `https:${part}` : part });
      // A full path (C:\Photos\talit.jpg) is matched by its file name.
      else sources.push({ kind: 'file', name: part.split(/[\\/]/).pop() });
    }
  }
  return sources;
}

// File names are matched without case, and "talit" also matches "talit.jpg".
const fileKey = (name) => String(name ?? '').trim().toLowerCase();
const stem = (name) => fileKey(name).replace(/\.[a-z0-9]{2,5}$/, '');

function uniqueSources(sources) {
  const seen = new Set();
  return sources.filter((s) => {
    const id = s.kind === 'url' ? `u:${s.url}` : s.kind === 'file' ? `f:${fileKey(s.name)}` : `e:${s.key}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

/** The picture the admin selected for a file name written in the sheet, if any. */
export function findLocalImage(localFiles, name) {
  const wanted = fileKey(name);
  return localFiles.find((f) => fileKey(f.name) === wanted)
    ?? localFiles.find((f) => stem(f.name) === stem(wanted))
    ?? null;
}

/**
 * Turns the images found in the sheet into rows the server accepts.
 * With `upload` (a File → URL function) pictures are uploaded and their links
 * written into each product's first row; without it (the preview) only the
 * check runs. Returns { rows, errors, counts } — counts maps product key → images.
 */
export async function resolveProductImages(read, localFiles, upload, onProgress) {
  const errors = [];
  const counts = new Map();
  const uploads = new Map(); // one upload per picture, even if used twice

  for (const [k, product] of read.imagesByProduct) {
    counts.set(k, product.sources.length);
    for (const s of product.sources) {
      if (s.kind === 'file' && !findLocalImage(localFiles, s.name)) {
        errors.push({
          row: 0,
          label: product.label,
          message: `התמונה "${s.name}" של "${product.name}" לא נבחרה — יש ללחוץ על "הוספת תמונות מהמחשב" ולבחור אותה (או להדביק את התמונה עצמה בתוך קובץ האקסל)`,
        });
      } else if (s.kind === 'file') {
        const f = findLocalImage(localFiles, s.name);
        uploads.set(`f:${fileKey(f.name)}`, f);
      } else if (s.kind === 'embedded') {
        uploads.set(`e:${s.key}`, new File([s.bytes], s.name, { type: s.type }));
      }
    }
  }

  const urls = new Map();
  if (upload && !errors.length && uploads.size) {
    const entries = [...uploads];
    let done = 0;
    onProgress?.(0, entries.length);
    // A few at a time: fast, without flooding the server.
    let next = 0;
    const worker = async () => {
      while (next < entries.length) {
        const [id, file] = entries[next++];
        urls.set(id, await upload(file));
        onProgress?.(++done, entries.length);
      }
    };
    await Promise.all(Array.from({ length: Math.min(3, entries.length) }, worker));
  }

  const firstRowOf = new Map();
  for (const row of read.rows) {
    const k = key(row.name);
    if (!firstRowOf.has(k)) firstRowOf.set(k, row);
  }
  const rows = read.rows.map((row) => ({ ...row }));
  const rowIndex = new Map(read.rows.map((row, i) => [row, i]));
  for (const [k, product] of read.imagesByProduct) {
    const first = firstRowOf.get(k);
    if (!first) continue;
    const links = product.sources.map((s) => {
      if (s.kind === 'url') return s.url;
      if (!upload) return null; // the preview checks links only
      if (s.kind === 'file') return urls.get(`f:${fileKey(findLocalImage(localFiles, s.name)?.name)}`);
      return urls.get(`e:${s.key}`);
    }).filter(Boolean);
    if (links.length) rows[rowIndex.get(first)].images = links.join(' ');
  }
  return { rows, errors, counts };
}

// One product (its catalog row and its per-colour rows) → server rows.
function expandProduct(cat, variantRecords) {
  const errors = [];
  const warnings = [];
  const source = cat ?? variantRecords[0];
  const fail = (record, message) => errors.push({ row: record.row, label: record.label, message });

  const shared = { name: source.name };
  for (const field of SHARED_FIELDS) {
    const value = cat?.[field] || variantRecords.find((r) => r[field])?.[field];
    if (value) shared[field] = value;
  }
  // Consumer price is "before discount" when there is a sale price.
  const basePrice = cat ? (cat.salePrice || cat.consumerPrice || cat.price || '') : '';
  if (cat?.salePrice) shared.originalPrice = cat.consumerPrice;
  else if (cat && 'salePrice' in cat) shared.clearOriginalPrice = true;

  let combos;
  const withDims = variantRecords.filter((r) => r.dims.some((d) => d.value));
  if (withDims.length || variantRecords.length > 1) {
    combos = variantRecords.map((r) => ({
      record: r,
      options: r.dims.filter((d) => d.value).map(({ name, value }) => ({ name, value })),
      price: r.price || r.consumerPrice || basePrice,
      sku: r.sku,
      stockQuantity: r.stockQuantity,
      inStock: r.inStock,
    }));
  } else {
    const only = variantRecords[0];
    const sizes = splitList(cat?.size);
    if (sizes.length > 1) {
      combos = sizes.map((size) => ({ record: cat, options: [{ name: 'גודל', value: size }], price: basePrice }));
    } else {
      if (sizes.length === 1) {
        warnings.push({ row: cat.row, label: cat.label, message: `הגודל "${sizes[0]}" לא נשמר — גדלים שונים מפרטים בגיליון "${SHEET_VARIANTS}"` });
      }
      combos = [{
        record: only ?? cat,
        options: [],
        price: only?.price || only?.consumerPrice || basePrice,
        sku: only?.sku || cat?.sku,
        stockQuantity: only?.stockQuantity ?? cat?.stockQuantity,
        inStock: only?.inStock ?? cat?.inStock,
      }];
    }
  }

  // Paid add-ons: every combination exists without and with each add-on.
  const addonNames = splitList(cat?.addons);
  let addons = [];
  if (addonNames.length) {
    const prices = splitList(cat.addonPrices).map(toNumber);
    if (prices.length !== addonNames.length && prices.length !== 1) {
      fail(cat, `ב"${cat.name}" יש ${addonNames.length} אפשרויות אבל ${prices.length} מחירי תוספת — צריך מחיר לכל אפשרות, מופרדים בפסיק, באותו סדר`);
    } else if (prices.some((p) => p === null)) {
      fail(cat, `מחיר התוספת "${cat.addonPrices}" אינו מספר תקין`);
    } else if (addonNames.length > MAX_ADDONS) {
      fail(cat, `אפשר עד ${MAX_ADDONS} אפשרויות בתשלום למוצר`);
    } else {
      addons = addonNames.map((name, i) => ({ name, price: prices.length === 1 ? prices[0] : prices[i] }));
    }
  }

  const rows = [];
  combos.forEach((combo, comboIndex) => {
    const base = toNumber(combo.price);
    // An unreadable price is sent as-is (no add-on rows) so the server names the cell.
    const masks = addons.length && base !== null ? 2 ** addons.length : 1;
    for (let mask = 0; mask < masks; mask++) {
      const chosen = addons.filter((_, i) => mask & (1 << i));
      rows.push({
        ...(comboIndex === 0 && mask === 0 ? shared : { name: source.name }),
        row: combo.record.row,
        label: combo.record.label,
        options: [
          ...combo.options,
          ...(masks > 1 ? addons.map((a, i) => ({ name: a.name, value: mask & (1 << i) ? YES : NO })) : []),
        ],
        price: masks > 1 ? String(base + chosen.reduce((sum, a) => sum + a.price, 0)) : combo.price,
        sku: mask === 0 ? combo.sku : '',
        stockQuantity: mask === 0 ? combo.stockQuantity : '',
        inStock: combo.inStock,
      });
    }
  });

  return { rows, errors, warnings };
}

// ---------- Writing ----------

const isAddon = (option) =>
  option.values?.length === 2 && option.values.includes(YES) && option.values.includes(NO);

function categoryPaths(tree) {
  const paths = new Map();
  for (const parent of tree) {
    paths.set(parent._id, parent.name);
    for (const child of parent.children ?? []) paths.set(child._id, `${parent.name} > ${child.name}`);
  }
  return paths;
}

const valuesOf = (variant) => variant.optionValues ?? {};

// Extra price of an add-on: a "כן" variant minus its otherwise-identical "לא" variant.
function addonPrice(product, addonName) {
  for (const v of product.variants) {
    if (valuesOf(v)[addonName] !== YES) continue;
    const partner = product.variants.find((w) => valuesOf(w)[addonName] === NO &&
      Object.entries(valuesOf(v)).every(([n, val]) => n === addonName || valuesOf(w)[n] === val));
    if (partner) return v.price - partner.price;
  }
  return '';
}

function buildWorkbookRows(products, categoryTree) {
  const paths = categoryPaths(categoryTree);
  const catalogRows = [];
  const variantRows = [];
  const extraDims = [];
  const colours = [];

  for (const p of products) {
    const options = p.options ?? [];
    const addonOptions = options.filter(isAddon);
    const dims = options.filter((o) => !isAddon(o)).map((o) => o.name);
    const variants = p.variants?.length > 1 ? p.variants : [];
    // The variant without any add-on is the product's "plain" version.
    const plain = variants.filter((v) => addonOptions.every((a) => valuesOf(v)[a.name] !== YES));

    catalogRows.push({
      sku: dims.length ? '' : (plain[0]?.sku ?? p.sku ?? ''),
      name: p.name,
      material: p.specs?.material ?? '',
      size: '',
      category: paths.get(p.category?._id ?? p.category) ?? '',
      consumerPrice: p.originalPrice ?? p.basePrice,
      salePrice: p.originalPrice ? p.basePrice : '',
      addons: addonOptions.map((a) => a.name).join(', '),
      addonPrices: addonOptions.map((a) => addonPrice(p, a.name)).join(', '),
      // Full links, so they open from the spreadsheet and re-import unchanged.
      images: (p.images ?? []).map((u) => (u.startsWith('/') ? window.location.origin + u : u)).join(', '),
    });

    if (!dims.length) continue;
    for (const v of plain) {
      const row = { sku: v.sku ?? '', name: p.name, price: v.price, dims: {} };
      for (const d of dims) {
        const value = valuesOf(v)[d] ?? '';
        row.dims[d] = value;
        if (![COLOUR_COLUMN, SIZE_COLUMN].includes(d) && !extraDims.includes(d)) extraDims.push(d);
        if ((d === COLOUR_COLUMN || d === 'צבע') && value && !colours.includes(value)) colours.push(value);
      }
      variantRows.push(row);
    }
  }
  return { catalogRows, variantRows, extraDims, colours };
}

async function writeWorkbook({ catalogRows, variantRows, extraDims, colours }, fileName) {
  const { default: writeXlsxFile } = await import('write-excel-file');
  const header = (labels) => labels.map((value) => ({ value, fontWeight: 'bold' }));
  const cell = (value) => (typeof value === 'number' ? { value, type: Number } : { value: value ?? '', type: String });

  const variantHeaders = ['מק"ט', 'שם המוצר', COLOUR_COLUMN, SIZE_COLUMN, 'מחיר', ...extraDims];
  const variantData = [
    header(variantHeaders),
    ...variantRows.map((r) => [
      cell(r.sku), cell(r.name), cell(r.dims[COLOUR_COLUMN]), cell(r.dims[SIZE_COLUMN]), cell(r.price),
      ...extraDims.map((d) => cell(r.dims[d])),
    ]),
  ];
  const helperData = colours.length ? colours.map((c) => [cell(c)]) : [[cell('')]];
  const catalogData = [
    header(CATALOG_COLUMNS.map((c) => c.label)),
    ...catalogRows.map((r) => CATALOG_COLUMNS.map((c) => cell(r[c.key]))),
  ];

  await writeXlsxFile([variantData, helperData, catalogData], {
    sheets: [SHEET_VARIANTS, SHEET_HELPER, SHEET_CATALOG],
    columns: [
      variantHeaders.map((_, i) => ({ width: i === 1 ? 30 : 14 })),
      [{ width: 18 }],
      CATALOG_COLUMNS.map((c) => ({ width: c.key === 'name' ? 30 : 14 })),
    ],
    rightToLeft: true,
    fileName,
  });
}

const TEMPLATE = {
  catalogRows: [
    { sku: 'TL-100', name: 'דוגמה - טלית צמר', material: 'צמר', category: 'טליתות', consumerPrice: 299, addons: 'רקמת שם', addonPrices: 50 },
    { sku: 'MZ-10', name: 'דוגמה - בית מזוזה מעץ זית', material: 'עץ זית', category: 'מזוזות', consumerPrice: 180, salePrice: 159 },
  ],
  variantRows: [
    { sku: 'TL-100-50', name: 'דוגמה - טלית צמר', price: 299, dims: { [COLOUR_COLUMN]: 'לבן כסף', [SIZE_COLUMN]: '50' } },
    { sku: 'TL-100-60', name: 'דוגמה - טלית צמר', price: 349, dims: { [COLOUR_COLUMN]: 'לבן כסף', [SIZE_COLUMN]: '60' } },
  ],
  extraDims: [],
  colours: ['ג\'ינס', 'כחול כסף', 'כחול נייבי', 'לבן ב"י', 'לבן כסף', 'לבן מבריק', 'מלאנז\' אפור',
    'מלאנז\' בורד', 'מלאנז\' ירוק', 'מלאנז\' כחול', 'צבעים', 'שחור', 'תכלת'],
};

export function downloadTemplate() {
  return writeWorkbook(TEMPLATE, 'תבנית-ייבוא-מוצרים.xlsx');
}

export function downloadProducts(products, categoryTree) {
  const date = new Date().toISOString().slice(0, 10);
  return writeWorkbook(buildWorkbookRows(products, categoryTree), `מוצרים-${date}.xlsx`);
}

