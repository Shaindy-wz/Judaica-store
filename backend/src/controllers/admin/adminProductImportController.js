import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import { toSlug, uniqueSlug } from './adminProductController.js';

// Bulk product import (spec 12-admin-panel.md §Product import/export).
//
// The admin page reads the CSV/Excel file in the browser and posts the rows
// with internal field names; every value arrives as raw text and is validated
// here. A file is applied all-or-nothing: with any error, nothing is written.
//
// Rows that share a product name form one product. A product whose rows fill
// the option columns is a variant product — one row per combination, each
// with its own price, SKU and stock. Rows of an existing product (matched by
// name, or by SKU for a simple product) update it; empty cells leave the
// stored value unchanged.

const MAX_ROWS = 5000;
const BADGES = ['חדש', 'מבצע', 'פופולרי'];
const YES = new Set(['כן', 'v', '✓', '✔', 'true', '1', 'yes', 'y']);
const NO = new Set(['לא', 'false', '0', 'no', 'n']);
const EXAMPLE_PREFIX = 'דוגמה';

const SPEC_FIELDS = ['material', 'kashrut', 'hashgacha', 'tradition', 'craftsmanship'];

const text = (value) => (value == null ? '' : String(value).trim());
const key = (value) => text(value).replace(/\s+/g, ' ').toLowerCase();
const listRows = (rows) => rows.map((r) => r.row).join(', ');

function parseNumber(raw, label, { integer = false } = {}) {
  const cleaned = text(raw).replace(/[₪\s,]/g, '');
  if (!cleaned) return { value: undefined };
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0) return { error: `${label} "${text(raw)}" אינו מספר תקין` };
  if (integer && !Number.isInteger(value)) return { error: `${label} חייבת להיות מספר שלם` };
  return { value };
}

function parseBool(raw, label) {
  const value = key(raw);
  if (!value) return { value: undefined };
  if (YES.has(value)) return { value: true };
  if (NO.has(value)) return { value: false };
  return { error: `${label}: יש לכתוב "כן" או "לא" (נכתב "${text(raw)}")` };
}

function splitList(raw, separator) {
  return text(raw).split(separator).map((s) => s.trim()).filter(Boolean);
}

// First non-empty value of a field across the rows of one product, so the
// shared product details may sit on any of its rows.
function firstFilled(rows, field) {
  for (const r of rows) if (text(r[field])) return r[field];
  return undefined;
}

function buildCategoryLookup(categories) {
  const byId = new Map(categories.map((c) => [String(c._id), c]));
  const byPath = new Map();
  const byName = new Map();
  for (const c of categories) {
    const parent = c.parent ? byId.get(String(c.parent)) : null;
    const path = parent ? `${key(parent.name)} > ${key(c.name)}` : key(c.name);
    byPath.set(path, c);
    const list = byName.get(key(c.name)) ?? [];
    list.push({ category: c, parent });
    byName.set(key(c.name), list);
  }

  return function resolve(raw) {
    const wanted = text(raw).split('>').map(key).filter(Boolean).join(' > ');
    if (byPath.has(wanted)) return { category: byPath.get(wanted) };
    const matches = byName.get(wanted) ?? [];
    if (matches.length === 1) return { category: matches[0].category };
    if (matches.length > 1) {
      const options = matches.map((m) => `"${m.parent ? `${m.parent.name} > ` : ''}${m.category.name}"`).join(' או ');
      return { error: `הקטגוריה "${text(raw)}" קיימת ביותר ממקום אחד — יש לכתוב ${options}` };
    }
    return { error: `הקטגוריה "${text(raw)}" לא קיימת. יש ליצור אותה קודם בעמוד הקטגוריות` };
  };
}

// Validates one product (all its rows) and returns the fields to write.
function buildProduct(rows, ctx) {
  const errors = [];
  const fail = (row, message) => errors.push({ row, message });
  const first = rows[0];
  const name = text(first.name).replace(/\s+/g, ' ');
  const fields = {};

  const variantRows = rows.filter((r) => (r.options ?? []).some((o) => text(o.value)));
  const hasVariants = variantRows.length > 0;

  // Match an existing product: by name, else by SKU for a simple product.
  let existing = ctx.productsByName.get(key(name));
  const productSku = hasVariants ? '' : text(firstFilled(rows, 'sku'));
  if (!existing && productSku) existing = ctx.productsBySku.get(productSku);
  if (existing && key(existing.name) !== key(name)) {
    const clash = ctx.productsByName.get(key(name));
    if (clash && String(clash._id) !== String(existing._id)) {
      fail(first.row, `לא ניתן לשנות את שם המוצר למק"ט ${productSku} — כבר קיים מוצר בשם "${name}"`);
    }
    fields.name = name;
  }
  if (!existing) fields.name = name;

  // Shared product details.
  const description = text(firstFilled(rows, 'description'));
  if (description) fields.description = description;

  const categoryRaw = firstFilled(rows, 'category');
  if (text(categoryRaw)) {
    const { category, error } = ctx.resolveCategory(categoryRaw);
    if (error) fail(first.row, error);
    else fields.category = category._id;
  }

  const badgeRaw = text(firstFilled(rows, 'badge'));
  if (badgeRaw) {
    if (badgeRaw === 'ללא') fields.badge = '';
    else if (BADGES.includes(badgeRaw)) fields.badge = badgeRaw;
    else fail(first.row, `תג "${badgeRaw}" לא מוכר — אפשר: ${BADGES.join(', ')} או ללא`);
  }

  const tags = splitList(firstFilled(rows, 'tags'), /[,;]/);
  if (tags.length) fields.tags = tags;

  const images = splitList(firstFilled(rows, 'images'), /[\s,|]+/);
  for (const url of images) {
    if (!/^(https?:\/\/|\/)/i.test(url)) {
      fail(first.row, `קישור התמונה "${url}" לא תקין — יש להדביק קישור מלא שמתחיל ב-https://`);
    }
  }
  if (images.length) fields.images = images;

  const originalPrice = parseNumber(firstFilled(rows, 'originalPrice'), 'מחיר לפני הנחה');
  if (originalPrice.error) fail(first.row, originalPrice.error);
  else if (originalPrice.value !== undefined) fields.originalPrice = originalPrice.value;

  for (const [field, label] of [['featured', 'מומלץ'], ['returnable', 'ניתן להחזרה'], ['customizable', 'מותאם אישית']]) {
    const parsed = parseBool(firstFilled(rows, field), label);
    if (parsed.error) fail(first.row, parsed.error);
    else if (parsed.value !== undefined) {
      fields[field === 'featured' ? 'featured' : `returnPolicy.${field}`] = parsed.value;
    }
  }
  const nonReturnableReason = text(firstFilled(rows, 'nonReturnableReason'));
  if (nonReturnableReason) fields['returnPolicy.nonReturnableReason'] = nonReturnableReason;

  for (const field of SPEC_FIELDS) {
    const value = text(firstFilled(rows, field));
    if (value) fields[`specs.${field}`] = value;
  }
  const metaTitle = text(firstFilled(rows, 'metaTitle'));
  if (metaTitle) fields['seo.metaTitle'] = metaTitle;
  const metaDescription = text(firstFilled(rows, 'metaDescription'));
  if (metaDescription) fields['seo.metaDescription'] = metaDescription;

  const claimSku = (sku, row) => {
    if (!sku) return;
    const owner = ctx.skuOwners.get(sku);
    if (owner && (!existing || String(owner._id) !== String(existing._id))) {
      fail(row, `המק"ט ${sku} כבר שייך למוצר "${owner.name}"`);
    }
    const seenAt = ctx.skusInFile.get(sku);
    if (seenAt !== undefined && seenAt !== row) fail(row, `המק"ט ${sku} מופיע בקובץ יותר מפעם אחת (גם בשורה ${seenAt})`);
    else ctx.skusInFile.set(sku, row);
  };

  if (hasVariants) {
    const optionNames = (variantRows[0].options ?? []).filter((o) => text(o.value)).map((o) => text(o.name));
    const valuesByOption = new Map(optionNames.map((n) => [n, []]));
    const combos = new Map();
    const variants = [];

    for (const r of rows) {
      const filled = (r.options ?? []).filter((o) => text(o.value));
      if (!filled.length) {
        fail(r.row, `למוצר "${name}" יש אפשרויות בשורות אחרות — יש למלא גם בשורה זו את ערכי האפשרויות`);
        continue;
      }
      const names = filled.map((o) => text(o.name));
      if (names.some((n) => !n)) {
        fail(r.row, 'יש ערך אפשרות בלי שם אפשרות (למשל "מידה")');
        continue;
      }
      if (names.length !== optionNames.length || names.some((n) => !valuesByOption.has(n))) {
        fail(r.row, `שמות האפשרויות חייבים להיות זהים בכל השורות של "${name}" (${optionNames.join(', ')})`);
        continue;
      }

      const optionValues = {};
      for (const o of filled) {
        optionValues[text(o.name)] = text(o.value);
        const values = valuesByOption.get(text(o.name));
        if (!values.includes(text(o.value))) values.push(text(o.value));
      }
      const comboKey = optionNames.map((n) => optionValues[n]).join(' / ');
      if (combos.has(comboKey)) {
        fail(r.row, `השילוב "${comboKey}" כבר מופיע בשורה ${combos.get(comboKey)}`);
        continue;
      }
      combos.set(comboKey, r.row);

      const price = parseNumber(r.price, 'מחיר');
      if (price.error) fail(r.row, price.error);
      else if (price.value === undefined) fail(r.row, `חסר מחיר לשילוב "${comboKey}"`);
      const stock = parseNumber(r.stockQuantity, 'כמות במלאי', { integer: true });
      if (stock.error) fail(r.row, stock.error);
      const inStock = parseBool(r.inStock, 'במלאי');
      if (inStock.error) fail(r.row, inStock.error);

      const sku = text(r.sku);
      claimSku(sku, r.row);
      variants.push({
        optionValues,
        price: price.value,
        sku: sku || undefined,
        stockQuantity: stock.value,
        inStock: inStock.value ?? (stock.value === 0 ? false : true),
      });
    }

    fields.options = optionNames.map((n) => ({ name: n, values: valuesByOption.get(n) }));
    fields.variants = variants;
    const prices = variants.map((v) => v.price).filter((p) => p !== undefined);
    if (prices.length) fields.basePrice = Math.min(...prices);
    fields.inStock = variants.some((v) => v.inStock);
  } else {
    if (rows.length > 1) {
      fail(first.row, `המוצר "${name}" מופיע בכמה שורות (${listRows(rows)}). מוצר עם כמה מידות/צבעים צריך את עמודות האפשרויות; אחרת יש להשאיר שורה אחת`);
    }
    if (existing?.variants?.length > 1) {
      fail(first.row, `ל"${name}" יש אפשרויות (מידות/צבעים) באתר — יש למלא את עמודות האפשרויות, שורה לכל שילוב, כדי לא למחוק אותן`);
    }

    const price = parseNumber(first.price, 'מחיר');
    if (price.error) fail(first.row, price.error);
    else if (price.value !== undefined) fields.basePrice = price.value;
    else if (!existing) fail(first.row, 'חסר מחיר');

    if (productSku) {
      claimSku(productSku, first.row);
      fields.sku = productSku;
    }

    const stock = parseNumber(first.stockQuantity, 'כמות במלאי', { integer: true });
    if (stock.error) fail(first.row, stock.error);
    else if (stock.value !== undefined) fields.stockQuantity = stock.value;
    const inStock = parseBool(first.inStock, 'במלאי');
    if (inStock.error) fail(first.row, inStock.error);
    else if (inStock.value !== undefined) fields.inStock = inStock.value;
    else if (stock.value === 0) fields.inStock = false;
  }

  if (fields.originalPrice !== undefined && fields.basePrice !== undefined && fields.originalPrice <= fields.basePrice) {
    fail(first.row, 'המחיר לפני הנחה חייב להיות גבוה מהמחיר');
  }

  return { name, existing, fields, errors, variantCount: hasVariants ? fields.variants.length : 0 };
}

export async function importProducts(req, res) {
  const { rows, dryRun = true } = req.body ?? {};
  if (!Array.isArray(rows) || !rows.length) {
    return res.status(400).json({ message: 'הקובץ ריק — לא נמצאו שורות מוצרים' });
  }
  if (rows.length > MAX_ROWS) {
    return res.status(400).json({ message: `אפשר לייבא עד ${MAX_ROWS} שורות בקובץ אחד` });
  }

  const [categories, products] = await Promise.all([
    Category.find().select('name parent').lean(),
    Product.find().select('name sku variants.sku').lean(),
  ]);

  const ctx = {
    resolveCategory: buildCategoryLookup(categories),
    productsByName: new Map(products.map((p) => [key(p.name), p])),
    productsBySku: new Map(products.filter((p) => p.sku).map((p) => [text(p.sku), p])),
    // Every SKU in the store, product- or variant-level, with the product owning it.
    skuOwners: new Map(products.flatMap((p) => [p.sku, ...(p.variants ?? []).map((v) => v.sku)]
      .filter(Boolean).map((sku) => [text(sku), p]))),
    skusInFile: new Map(),
  };

  const errors = [];
  const warnings = [];
  const groups = new Map();
  for (const r of rows) {
    const name = text(r.name);
    if (!name) {
      errors.push({ row: r.row, message: 'חסר שם מוצר' });
      continue;
    }
    if (name.startsWith(EXAMPLE_PREFIX)) {
      warnings.push({ row: r.row, message: `שורת הדוגמה "${name}" דולגה` });
      continue;
    }
    const k = key(name);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  }

  const plan = [];
  for (const group of groups.values()) {
    const product = buildProduct(group, ctx);
    errors.push(...product.errors);
    plan.push(product);
  }
  errors.sort((a, b) => a.row - b.row);

  const summary = {
    create: plan.filter((p) => !p.existing).length,
    update: plan.filter((p) => p.existing).length,
    errors: errors.length,
  };
  const preview = plan.map((p) => ({
    name: p.name,
    action: p.existing ? 'update' : 'create',
    variants: p.variantCount,
    price: p.fields.basePrice,
  }));

  if (dryRun || errors.length) {
    return res.status(dryRun ? 200 : 400).json({
      dryRun: true,
      summary,
      products: preview,
      errors,
      warnings,
      ...(errors.length && !dryRun ? { message: 'בקובץ יש שגיאות — לא נשמר דבר' } : {}),
    });
  }

  // Validate every document before the first write, so a schema error cannot
  // leave the catalogue half-imported.
  const docs = [];
  const slugsInBatch = new Set();
  for (const p of plan) {
    const doc = p.existing ? await Product.findById(p.existing._id) : new Product();
    doc.set(p.fields);
    if (!p.existing || p.fields.name) {
      // uniqueSlug only sees saved products, so also avoid slugs taken earlier in this file.
      const base = toSlug(doc.name) || 'product';
      let slug = await uniqueSlug(base, p.existing?._id);
      for (let n = 2; slugsInBatch.has(slug); n++) {
        slug = await uniqueSlug(`${base}-${n}`, p.existing?._id);
      }
      slugsInBatch.add(slug);
      doc.slug = slug;
    }
    try {
      await doc.validate();
    } catch (invalid) {
      return res.status(400).json({ message: `שגיאה במוצר "${p.name}": ${invalid.message}` });
    }
    docs.push(doc);
  }
  for (const doc of docs) await doc.save();

  res.json({ dryRun: false, summary, products: preview, errors: [], warnings });
}
