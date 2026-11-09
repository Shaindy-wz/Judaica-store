// Pictures pasted into an Excel workbook (spec 12-admin-panel.md §Product import/export).
//
// An .xlsx file is a zip of XML parts. Pictures live in xl/media/ and are tied
// to a sheet row in one of two ways:
//   • floating over the sheet ("Insert → Pictures"): the sheet's drawing part
//     anchors each picture to a cell (xl/drawings/drawingN.xml);
//   • inside a cell (Excel 365 "Place in Cell"): the cell carries vm="N",
//     which leads through xl/metadata.xml and xl/richData/ to the picture.
// Both are read here into { row, col, key, name, type, bytes } per sheet name;
// rows and columns are 1-based like Excel's own numbering.
//
// The zip is opened with SheetJS's bundled reader (XLSX.CFB), so no extra
// library is needed. Parsing uses small regular expressions over these
// machine-written parts; every lookup is optional, so a part that is missing
// or unusual skips its pictures instead of failing the import.

const MIME = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', jpe: 'image/jpeg', gif: 'image/gif',
  bmp: 'image/bmp', webp: 'image/webp', tif: 'image/tiff', tiff: 'image/tiff',
};

const attrs = (tag) => {
  const out = {};
  for (const m of tag.matchAll(/([\w:]+)\s*=\s*"([^"]*)"/g)) out[m[1]] = m[2];
  return out;
};
// Attribute regardless of its namespace prefix (r:id, r:embed...).
const attr = (a, name) => a[name] ?? Object.entries(a).find(([k]) => k.endsWith(`:${name}`))?.[1];
const tags = (xml, name) => [...xml.matchAll(new RegExp(`<(?:\\w+:)?${name}\\b[^>]*>`, 'g'))].map((m) => attrs(m[0]));
const blocks = (xml, name) =>
  [...xml.matchAll(new RegExp(`<((?:\\w+:)?${name})\\b[^>]*>([\\s\\S]*?)</\\1>`, 'g'))].map((m) => ({ open: attrs(m[0].slice(0, m[0].indexOf('>') + 1)), body: m[2] }));
const firstNumber = (xml, name) => {
  const m = xml.match(new RegExp(`<(?:\\w+:)?${name}>\\s*(\\d+)\\s*<`));
  return m ? Number(m[1]) : null;
};

function resolvePath(fromPart, target) {
  if (target.startsWith('/')) return target.slice(1);
  const parts = fromPart.split('/').slice(0, -1);
  for (const seg of target.split('/')) {
    if (seg === '..') parts.pop();
    else if (seg && seg !== '.') parts.push(seg);
  }
  return parts.join('/');
}
const relsPathOf = (part) => {
  const i = part.lastIndexOf('/');
  return `${part.slice(0, i)}/_rels/${part.slice(i + 1)}.rels`;
};

const columnNumber = (letters) => [...letters.toUpperCase()].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);

export function readEmbeddedImages(XLSX, data) {
  let zip;
  try {
    zip = XLSX.CFB.read(data, { type: 'array' });
  } catch {
    return new Map();
  }
  // Paths inside the container are matched case-insensitively.
  const files = new Map();
  zip.FullPaths.forEach((full, i) => {
    const entry = zip.FileIndex[i];
    if (entry?.type === 2 && entry.content) files.set(full.replace(/^[^/]*\//, '').toLowerCase(), entry.content);
  });
  const bytes = (path) => files.get(path.toLowerCase()) ?? null;
  const decoder = new TextDecoder('utf-8');
  const text = (path) => {
    const b = bytes(path);
    return b ? decoder.decode(b instanceof Uint8Array ? b : Uint8Array.from(b)) : '';
  };
  const rels = (part) => {
    const map = new Map();
    for (const r of tags(text(relsPathOf(part)), 'Relationship')) {
      if (r.Id && r.Target && r.TargetMode !== 'External') {
        map.set(r.Id, { type: r.Type ?? '', path: resolvePath(part, r.Target) });
      }
    }
    return map;
  };

  const media = (path) => {
    const content = bytes(path);
    const ext = path.split('.').pop().toLowerCase();
    if (!content || !MIME[ext]) return null; // e.g. EMF/WMF vector clip-art
    return {
      key: path,
      name: path.split('/').pop(),
      type: MIME[ext],
      bytes: content instanceof Uint8Array ? content : Uint8Array.from(content),
    };
  };

  const workbookPart = 'xl/workbook.xml';
  const workbookRels = rels(workbookPart);
  const result = new Map();

  // In-cell pictures: rich value index → media path (shared by all sheets).
  const richImages = readRichValueImages(text, rels);

  for (const sheet of tags(text(workbookPart), 'sheet')) {
    const sheetPath = workbookRels.get(attr(sheet, 'id'))?.path;
    if (!sheetPath || !sheet.name) continue;
    const found = [];

    // Floating pictures.
    for (const rel of rels(sheetPath).values()) {
      if (!rel.type.endsWith('/drawing')) continue;
      const drawingXml = text(rel.path);
      const drawingRels = rels(rel.path);
      for (const kind of ['twoCellAnchor', 'oneCellAnchor']) {
        for (const anchor of blocks(drawingXml, kind)) {
          const from = blocks(anchor.body, 'from')[0]?.body ?? '';
          const to = blocks(anchor.body, 'to')[0]?.body ?? '';
          const row = firstNumber(from, 'row');
          if (row === null) continue;
          const toRow = firstNumber(to, 'row');
          // A picture spanning a group shape may hold several pictures.
          for (const blip of tags(anchor.body, 'blip')) {
            const image = media(drawingRels.get(attr(blip, 'embed'))?.path ?? '');
            if (!image) continue;
            found.push({
              ...image,
              row: row + 1,
              lastRow: toRow === null ? row + 1 : Math.max(row + 1, toRow + 1),
              col: (firstNumber(from, 'col') ?? 0) + 1,
            });
          }
        }
      }
    }

    // Pictures placed in cells.
    if (richImages) {
      for (const cell of tags(text(sheetPath), 'c')) {
        if (!cell.vm || !cell.r) continue;
        const path = richImages(Number(cell.vm));
        const image = path && media(path);
        const ref = cell.r.match(/^([A-Z]+)(\d+)$/i);
        if (image && ref) {
          const row = Number(ref[2]);
          found.push({ ...image, row, lastRow: row, col: columnNumber(ref[1]) });
        }
      }
    }

    found.sort((a, b) => a.row - b.row || a.col - b.col);
    if (found.length) result.set(sheet.name, found);
  }
  return result;
}

// Returns vm (1-based cell attribute) → media path, or null without rich data.
function readRichValueImages(text, rels) {
  const richValueXml = text('xl/richData/rdrichvalue.xml');
  const relPart = 'xl/richData/richValueRel.xml';
  const relXml = text(relPart);
  if (!richValueXml || !relXml) return null;

  // Which position in a rich value holds the picture's relationship index.
  const structures = blocks(text('xl/richData/rdrichvaluestructure.xml'), 's').map((s) =>
    tags(s.body, 'k').findIndex((k) => k.n === '_rvRel:LocalImageIdentifier'));
  const values = blocks(richValueXml, 'rv').map((rv) => {
    const position = structures[Number(rv.open.s ?? 0)];
    const cells = [...rv.body.matchAll(/<(?:\w+:)?v\b[^>]*>([^<]*)</g)].map((m) => m[1]);
    const value = cells[position >= 0 ? position : 0];
    return value === undefined ? null : Number(value);
  });
  const relIds = tags(relXml, 'rel').map((r) => attr(r, 'id'));
  const relTargets = rels(relPart);

  // vm → valueMetadata block → rc v → futureMetadata XLRICHVALUE block → rvb i.
  const metadataXml = text('xl/metadata.xml');
  const future = blocks(metadataXml, 'futureMetadata').find((f) => f.open.name === 'XLRICHVALUE');
  const futureIndex = future ? blocks(future.body, 'bk').map((bk) => {
    const rvb = tags(bk.body, 'rvb')[0];
    return rvb ? Number(rvb.i) : null;
  }) : [];
  const valueMetadata = blocks(metadataXml, 'valueMetadata')[0];
  const vmToFuture = valueMetadata ? blocks(valueMetadata.body, 'bk').map((bk) => {
    const rc = tags(bk.body, 'rc')[0];
    return rc ? Number(rc.v) : null;
  }) : [];

  return (vm) => {
    let richIndex = vm - 1; // files without metadata number rich values directly
    if (vmToFuture.length) {
      const f = vmToFuture[vm - 1];
      richIndex = f === null || f === undefined ? null : futureIndex[f] ?? f;
    }
    const relIndex = richIndex === null ? null : values[richIndex];
    const relId = relIndex === null || relIndex === undefined ? null : relIds[relIndex];
    return relId ? relTargets.get(relId)?.path ?? null : null;
  };
}
