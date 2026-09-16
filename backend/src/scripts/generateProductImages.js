/**
 * Generates the demo catalogue artwork as SVG files.
 *
 *   npm run seed:images
 *
 * Output:
 *   frontend/public/images/products/<slug>-1..3.svg
 *   frontend/public/images/categories/<slug>.svg
 *
 * These are illustrated placeholders, not photography. When the client supplies
 * real photos, drop them in with the same file names (or update the `images`
 * array in demoCatalog.js) — nothing else needs to change.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { categories, products } from './demoCatalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_IMAGES = path.resolve(__dirname, '../../../frontend/public/images');
const PRODUCT_DIR = path.join(PUBLIC_IMAGES, 'products');
const CATEGORY_DIR = path.join(PUBLIC_IMAGES, 'categories');

/* ------------------------------------------------------------------ */
/* Palettes                                                            */
/* ------------------------------------------------------------------ */

const PALETTES = {
  ivory:    { bg: '#f7f3ea', main: '#f2ece0', dark: '#d9d0bd', light: '#fffdf8', metal: '#c9a227' },
  cream:    { bg: '#f8f2e4', main: '#eadfc6', dark: '#c9b48c', light: '#fdf9ef', metal: '#b8933a' },
  sky:      { bg: '#eef4f8', main: '#cfe0ec', dark: '#9ab8ce', light: '#f7fbfd', metal: '#c9a227' },
  azure:    { bg: '#eaf1f7', main: '#2f6b9e', dark: '#17456b', light: '#a8c8e0', metal: '#c9a227' },
  silver:   { bg: '#f2f3f4', main: '#cfd4d9', dark: '#9aa3ac', light: '#fbfcfd', metal: '#8e9aa5' },
  gold:     { bg: '#faf4e3', main: '#d8b64a', dark: '#8a6d1a', light: '#f0dda0', metal: '#c9a227' },
  royal:    { bg: '#eef1f6', main: '#113554', dark: '#04101f', light: '#1f6895', metal: '#c9a227' },
  graphite: { bg: '#f1f1f0', main: '#2b2b2b', dark: '#111111', light: '#565656', metal: '#8a6d1a' },
  stone:    { bg: '#f5f1ea', main: '#c8b79c', dark: '#8d7d63', light: '#e5dccb', metal: '#a8894a' },
};

const pal = (name) => PALETTES[name] ?? PALETTES.ivory;

/* ------------------------------------------------------------------ */
/* Frame                                                               */
/* ------------------------------------------------------------------ */

function corner(x, y, sx, sy, color) {
  return `<path d="M ${x} ${y + sy * 46} L ${x} ${y} L ${x + sx * 46} ${y}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="square" opacity="0.55"/>`;
}

function frame(colors, body, { tone = 0 } = {}) {
  const bg = tone === 1 ? '#fbf8f1' : tone === 2 ? '#efeae0' : colors.bg;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.55"/>
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="45%" r="65%">
      <stop offset="60%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#04101f" stop-opacity="0.07"/>
    </radialGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colors.metal}" stop-opacity="0.55"/>
      <stop offset="50%" stop-color="${colors.metal}"/>
      <stop offset="100%" stop-color="${colors.metal}" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#bgGrad)"/>
  <rect width="800" height="800" fill="url(#vignette)"/>
  ${corner(48, 48, 1, 1, colors.metal)}
  ${corner(752, 48, -1, 1, colors.metal)}
  ${corner(48, 752, 1, -1, colors.metal)}
  ${corner(752, 752, -1, -1, colors.metal)}
  <ellipse cx="400" cy="690" rx="210" ry="26" fill="#04101f" opacity="0.08"/>
  ${body}
</svg>
`;
}

/* ------------------------------------------------------------------ */
/* Illustrations                                                       */
/* ------------------------------------------------------------------ */

const fringe = (x, y, len, color) =>
  [0, 6, 12, 18]
    .map((dx) => `<path d="M ${x + dx} ${y} q 3 ${len / 2} -2 ${len}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>`)
    .join('');

const ART = {
  tallit: (c) => `
    <g>
      <path d="M 190 190 q 210 -46 420 0 l 0 400 q -210 46 -420 0 Z" fill="${c.main}" stroke="${c.dark}" stroke-width="3"/>
      <path d="M 190 190 q 210 -46 420 0 l 0 24 q -210 -46 -420 0 Z" fill="${c.light}" opacity="0.85"/>
      ${[250, 272, 294, 470, 492, 514].map((y) => `<path d="M 190 ${y} q 210 -40 420 0" fill="none" stroke="${c.dark}" stroke-width="9" opacity="0.55"/>`).join('')}
      ${[236, 316, 456, 536].map((y) => `<path d="M 190 ${y} q 210 -40 420 0" fill="none" stroke="${c.metal}" stroke-width="2.5" opacity="0.75"/>`).join('')}
      ${fringe(196, 592, 78, c.dark)}
      ${fringe(578, 592, 78, c.dark)}
      ${fringe(196, 176, -66, c.dark)}
      ${fringe(578, 176, -66, c.dark)}
    </g>`,

  tzitzit: (c) => `
    <g>
      <path d="M 250 180 h 300 a 16 16 0 0 1 16 16 v 424 a 16 16 0 0 1 -16 16 h -300 a 16 16 0 0 1 -16 -16 v -424 a 16 16 0 0 1 16 -16 Z" fill="${c.main}" stroke="${c.dark}" stroke-width="3"/>
      <path d="M 356 180 q 44 66 88 0" fill="${c.bg}" stroke="${c.dark}" stroke-width="3"/>
      ${[300, 320, 480, 500].map((y) => `<rect x="234" y="${y}" width="332" height="10" fill="${c.dark}" opacity="0.5"/>`).join('')}
      <rect x="234" y="352" width="332" height="3" fill="${c.metal}" opacity="0.7"/>
      ${fringe(242, 636, 92, c.dark)}
      ${fringe(534, 636, 92, c.dark)}
      ${fringe(242, 172, -70, c.dark)}
      ${fringe(534, 172, -70, c.dark)}
    </g>`,

  strings: (c) => `
    <g>
      <rect x="316" y="196" width="168" height="54" rx="10" fill="${c.metal}" opacity="0.25" stroke="${c.metal}" stroke-width="2"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const x = 336 + i * 18;
        return `<path d="M ${x} 250 q ${i % 2 ? 14 : -14} 150 ${i % 2 ? 6 : -6} 340" fill="none" stroke="${c.main === '#2f6b9e' ? c.main : '#f4efe3'}" stroke-width="7" stroke-linecap="round" stroke-opacity="0.95"/>
                <path d="M ${x} 250 q ${i % 2 ? 14 : -14} 150 ${i % 2 ? 6 : -6} 340" fill="none" stroke="${c.dark}" stroke-width="1.4" stroke-opacity="0.4"/>`;
      }).join('')}
      ${[330, 400, 470, 540].map((y, i) => `<ellipse cx="${400 + (i % 2 ? 6 : -6)}" cy="${y}" rx="76" ry="15" fill="${c.dark}" opacity="0.28"/>`).join('')}
    </g>`,

  tefillin: (c) => `
    <g>
      <rect x="188" y="330" width="192" height="150" rx="8" fill="${c.dark}"/>
      <rect x="188" y="330" width="192" height="26" rx="6" fill="${c.light}" opacity="0.25"/>
      <rect x="180" y="470" width="208" height="26" rx="6" fill="${c.main}" stroke="${c.dark}" stroke-width="2"/>
      <path d="M 284 330 v 150" stroke="${c.light}" stroke-width="2" opacity="0.3"/>
      <rect x="430" y="300" width="182" height="182" rx="8" fill="${c.dark}"/>
      <rect x="430" y="300" width="182" height="26" rx="6" fill="${c.light}" opacity="0.25"/>
      <rect x="422" y="472" width="198" height="26" rx="6" fill="${c.main}" stroke="${c.dark}" stroke-width="2"/>
      <path d="M 490 300 v 182 M 552 300 v 182" stroke="${c.light}" stroke-width="2" opacity="0.28"/>
      <path d="M 250 496 q -70 90 30 160 M 330 496 q 60 90 -20 160" fill="none" stroke="${c.dark}" stroke-width="13" stroke-linecap="round"/>
      <path d="M 470 498 q -60 100 40 158 M 570 498 q 50 100 -30 158" fill="none" stroke="${c.dark}" stroke-width="13" stroke-linecap="round"/>
    </g>`,

  strap: (c) => `
    <g>
      ${[0, 1, 2, 3].map((i) => `<ellipse cx="400" cy="${380 + i * 34}" rx="${172 - i * 12}" ry="${52 - i * 4}" fill="none" stroke="${c.dark}" stroke-width="17" stroke-linecap="round"/>`).join('')}
      <path d="M 400 258 q 120 40 90 130" fill="none" stroke="${c.dark}" stroke-width="17" stroke-linecap="round"/>
      <ellipse cx="400" cy="380" rx="172" ry="52" fill="none" stroke="${c.metal}" stroke-width="1.5" opacity="0.5"/>
    </g>`,

  mezuzah: (c) => `
    <g>
      <rect x="330" y="150" width="140" height="500" rx="26" fill="${c.main}" stroke="${c.dark}" stroke-width="3"/>
      <rect x="352" y="176" width="96" height="448" rx="18" fill="${c.light}" opacity="0.75"/>
      <rect x="368" y="230" width="64" height="340" rx="10" fill="${c.bg}" opacity="0.9" stroke="${c.dark}" stroke-width="1.5"/>
      <text x="400" y="212" font-family="serif" font-size="62" fill="url(#metal)" text-anchor="middle">ש</text>
      ${[300, 380, 460, 540].map((y) => `<path d="M 378 ${y} h 44" stroke="${c.dark}" stroke-width="2" opacity="0.35"/>`).join('')}
      <circle cx="400" cy="616" r="7" fill="${c.metal}"/>
      <circle cx="400" cy="182" r="7" fill="${c.metal}"/>
    </g>`,

  scroll: (c) => `
    <g>
      <rect x="230" y="220" width="340" height="360" rx="6" fill="#f6efdd" stroke="${c.dark}" stroke-width="2.5"/>
      <path d="M 230 220 q 170 -18 340 0 M 230 580 q 170 18 340 0" fill="none" stroke="${c.dark}" stroke-width="2" opacity="0.5"/>
      ${Array.from({ length: 11 }, (_, i) => `<path d="M 268 ${262 + i * 28} h ${i % 3 === 2 ? 200 : 264}" stroke="#3a3226" stroke-width="4" opacity="0.6" stroke-linecap="round"/>`).join('')}
      <rect x="206" y="204" width="26" height="392" rx="13" fill="${c.metal}" opacity="0.85"/>
      <rect x="568" y="204" width="26" height="392" rx="13" fill="${c.metal}" opacity="0.85"/>
    </g>`,

  gift: (c) => `
    <g>
      <rect x="216" y="316" width="368" height="284" rx="10" fill="${c.main}" stroke="${c.dark}" stroke-width="3"/>
      <rect x="196" y="272" width="408" height="72" rx="10" fill="${c.light}" stroke="${c.dark}" stroke-width="3"/>
      <rect x="368" y="272" width="64" height="328" fill="url(#metal)" opacity="0.9"/>
      <path d="M 400 272 q -96 -78 -34 -104 q 44 -18 34 104 Z" fill="url(#metal)" opacity="0.95"/>
      <path d="M 400 272 q 96 -78 34 -104 q -44 -18 -34 104 Z" fill="url(#metal)" opacity="0.95"/>
      <circle cx="400" cy="266" r="15" fill="${c.metal}"/>
    </g>`,

  candles: (c) => `
    <g>
      ${[300, 500].map((x) => `
        <path d="M ${x - 62} 620 q 62 -16 124 0 l -16 -26 q -46 -10 -92 0 Z" fill="${c.main}" stroke="${c.dark}" stroke-width="2.5"/>
        <path d="M ${x - 20} 594 l 8 -180 h 24 l 8 180 Z" fill="${c.main}" stroke="${c.dark}" stroke-width="2.5"/>
        <ellipse cx="${x}" cy="414" rx="34" ry="12" fill="${c.light}" stroke="${c.dark}" stroke-width="2.5"/>
        <rect x="${x - 13}" y="316" width="26" height="100" rx="5" fill="#f6f1e4" stroke="${c.dark}" stroke-width="2"/>
        <path d="M ${x} 316 v -18" stroke="#3a3226" stroke-width="3"/>
        <path d="M ${x} 240 q 26 34 0 58 q -26 -24 0 -58 Z" fill="#e8a33a"/>
        <path d="M ${x} 258 q 13 18 0 30 q -13 -12 0 -30 Z" fill="#fbe6a8"/>
      `).join('')}
    </g>`,

  challah: (c) => `
    <g>
      <path d="M 176 268 h 448 v 296 q -224 44 -448 0 Z" fill="${c.main}" stroke="${c.dark}" stroke-width="3"/>
      <rect x="212" y="304" width="376" height="228" rx="6" fill="none" stroke="url(#metal)" stroke-width="4"/>
      <rect x="230" y="322" width="340" height="192" rx="4" fill="none" stroke="${c.metal}" stroke-width="1.5" opacity="0.6"/>
      <g opacity="0.9">
        <path d="M 286 470 v -70 h 30 v 70 M 336 470 v -96 h 34 v 96 M 390 470 v -60 h 26 v 60 M 436 470 v -108 h 38 v 108 M 494 470 v -74 h 28 v 74" fill="url(#metal)"/>
        <path d="M 270 470 h 268" stroke="${c.metal}" stroke-width="5"/>
        <path d="M 350 374 l 17 -26 l 17 26 Z M 447 362 l 19 -30 l 19 30 Z" fill="url(#metal)"/>
      </g>
      ${[188, 240, 292, 344, 396, 448, 500, 552, 604].map((x) => `<path d="M ${x} 564 v 34" stroke="${c.metal}" stroke-width="3" opacity="0.65" stroke-linecap="round"/>`).join('')}
    </g>`,

  cup: (c) => `
    <g>
      <path d="M 306 250 h 188 l -18 176 q -76 34 -152 0 Z" fill="${c.main}" stroke="${c.dark}" stroke-width="3"/>
      <path d="M 322 274 h 156 l -8 74 q -70 26 -140 0 Z" fill="${c.light}" opacity="0.55"/>
      <path d="M 400 426 v 118" stroke="${c.main}" stroke-width="26"/>
      <path d="M 400 426 v 118" stroke="${c.dark}" stroke-width="2" opacity="0.4"/>
      <ellipse cx="400" cy="472" rx="34" ry="14" fill="${c.main}" stroke="${c.dark}" stroke-width="2"/>
      <path d="M 310 596 q 90 -34 180 0 q -90 24 -180 0 Z" fill="${c.main}" stroke="${c.dark}" stroke-width="3"/>
      <path d="M 306 250 h 188" stroke="url(#metal)" stroke-width="6"/>
      <path d="M 330 344 q 70 22 140 0" fill="none" stroke="${c.metal}" stroke-width="2" opacity="0.6"/>
    </g>`,

  kippah: (c) => `
    <g>
      <path d="M 178 494 a 222 168 0 0 1 444 0 Z" fill="${c.main}" stroke="${c.dark}" stroke-width="3"/>
      <path d="M 178 494 a 222 26 0 0 0 444 0" fill="${c.dark}" opacity="0.35"/>
      ${[-150, -75, 0, 75, 150].map((dx) => `<path d="M 400 326 q ${dx * 1.2} 60 ${dx} 168" fill="none" stroke="${c.dark}" stroke-width="2" opacity="0.35"/>`).join('')}
      <path d="M 196 470 a 214 152 0 0 1 408 0" fill="none" stroke="url(#metal)" stroke-width="3" opacity="0.8"/>
      <circle cx="400" cy="328" r="8" fill="${c.metal}" opacity="0.8"/>
    </g>`,

  wick: (c) => `
    <g>
      ${[[280, 470], [400, 500], [520, 470]].map(([x, y]) => `
        <path d="M ${x - 56} ${y - 84} q 56 132 112 0 Z" fill="${c.light}" opacity="0.6" stroke="${c.dark}" stroke-width="2"/>
        <path d="M ${x - 52} ${y - 30} q 52 60 104 0" fill="#e6c98a" opacity="0.55"/>
        <ellipse cx="${x}" cy="${y - 84}" rx="56" ry="15" fill="${c.light}" stroke="${c.dark}" stroke-width="2"/>
        <circle cx="${x}" cy="${y - 84}" r="14" fill="#f0e6cf" stroke="${c.dark}" stroke-width="1.5"/>
        <path d="M ${x} ${y - 92} v -20" stroke="#3a3226" stroke-width="3"/>
        <path d="M ${x} ${y - 176} q 24 32 0 56 q -24 -24 0 -56 Z" fill="#e8a33a"/>
        <path d="M ${x} ${y - 160} q 12 17 0 29 q -12 -12 0 -29 Z" fill="#fbe6a8"/>
      `).join('')}
    </g>`,

  oil: (c) => `
    <g>
      <path d="M 342 244 h 116 v 74 q 86 54 86 152 v 152 a 26 26 0 0 1 -26 26 h -236 a 26 26 0 0 1 -26 -26 v -152 q 0 -98 86 -152 Z" fill="${c.main}" opacity="0.35" stroke="${c.dark}" stroke-width="3"/>
      <path d="M 292 458 q 108 -34 216 0 v 158 a 20 20 0 0 1 -20 20 h -176 a 20 20 0 0 1 -20 -20 Z" fill="${c.metal}" opacity="0.55"/>
      <rect x="334" y="200" width="132" height="52" rx="10" fill="${c.dark}" opacity="0.75"/>
      <rect x="316" y="486" width="168" height="96" rx="6" fill="#fdf9ee" opacity="0.9" stroke="${c.dark}" stroke-width="1.5"/>
      ${[512, 534, 556].map((y, i) => `<path d="M 340 ${y} h ${i === 1 ? 96 : 120}" stroke="${c.dark}" stroke-width="4" opacity="0.4" stroke-linecap="round"/>`).join('')}
    </g>`,

  pouch: (c) => `
    <g>
      <rect x="188" y="258" width="424" height="308" rx="26" fill="${c.main}" stroke="${c.dark}" stroke-width="3"/>
      <rect x="188" y="258" width="424" height="42" rx="20" fill="${c.dark}" opacity="0.3"/>
      <path d="M 206 280 h 388" stroke="url(#metal)" stroke-width="5"/>
      ${Array.from({ length: 26 }, (_, i) => `<path d="M ${210 + i * 15} 272 v 16" stroke="${c.metal}" stroke-width="2" opacity="0.7"/>`).join('')}
      <rect x="248" y="336" width="304" height="180" rx="8" fill="none" stroke="url(#metal)" stroke-width="4"/>
      <path d="M 296 470 v -58 h 26 v 58 M 342 470 v -84 h 30 v 84 M 392 470 v -50 h 24 v 50 M 436 470 v -94 h 32 v 94 M 488 470 v -64 h 26 v 64" fill="url(#metal)" opacity="0.9"/>
      <path d="M 282 470 h 240" stroke="${c.metal}" stroke-width="5"/>
      <path d="M 356 386 l 16 -24 l 16 24 Z M 446 376 l 17 -26 l 17 26 Z" fill="url(#metal)"/>
      <rect x="368" y="238" width="64" height="26" rx="10" fill="${c.dark}" opacity="0.6"/>
    </g>`,

  book: (c) => `
    <g>
      <path d="M 246 202 h 322 a 14 14 0 0 1 14 14 v 384 a 14 14 0 0 1 -14 14 h -322 Z" fill="${c.main}" stroke="${c.dark}" stroke-width="3"/>
      <path d="M 222 202 h 30 v 412 h -30 a 12 12 0 0 1 -12 -12 v -388 a 12 12 0 0 1 12 -12 Z" fill="${c.dark}"/>
      <rect x="286" y="248" width="248" height="316" rx="4" fill="none" stroke="url(#metal)" stroke-width="4"/>
      <rect x="302" y="264" width="216" height="284" rx="3" fill="none" stroke="${c.metal}" stroke-width="1.5" opacity="0.55"/>
      <path d="M 340 372 h 140 M 340 404 h 140 M 366 436 h 88" stroke="url(#metal)" stroke-width="7" stroke-linecap="round"/>
      <path d="M 410 300 l 22 -34 l 22 34 Z M 344 306 l 20 -30 l 20 30 Z" fill="url(#metal)" opacity="0.85"/>
      <path d="M 568 216 v 384" stroke="#ffffff" stroke-width="10" opacity="0.75"/>
      <path d="M 574 224 v 368" stroke="${c.dark}" stroke-width="2" opacity="0.25"/>
      <path d="M 400 614 v 92" stroke="${c.metal}" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
    </g>`,
};

/* ------------------------------------------------------------------ */
/* Views                                                               */
/* ------------------------------------------------------------------ */

/** Three views per product so the gallery thumbnails differ from each other. */
const VIEWS = [
  (art) => art,
  (art) => `<g transform="translate(400 400) scale(1.32) translate(-400 -400)">${art}</g>`,
  (art) => `<g transform="translate(400 415) rotate(-7) scale(0.86) translate(-400 -400)">${art}</g>`,
];

function renderProduct(product, viewIndex) {
  const colors = pal(product.palette);
  const art = (ART[product.art] ?? ART.gift)(colors);
  return frame(colors, VIEWS[viewIndex](art), { tone: viewIndex });
}

function renderCategory(category) {
  const colors = pal(category.art === 'tefillin' || category.art === 'book' ? 'royal' : 'cream');
  const art = (ART[category.art] ?? ART.gift)(colors);
  return frame(colors, `<g transform="translate(400 400) scale(0.9) translate(-400 -400)">${art}</g>`);
}

/* ------------------------------------------------------------------ */

function main() {
  fs.mkdirSync(PRODUCT_DIR, { recursive: true });
  fs.mkdirSync(CATEGORY_DIR, { recursive: true });

  let count = 0;
  for (const product of products) {
    VIEWS.forEach((_, index) => {
      fs.writeFileSync(
        path.join(PRODUCT_DIR, `${product.slug}-${index + 1}.svg`),
        renderProduct(product, index),
        'utf8'
      );
      count += 1;
    });
  }

  let categoryCount = 0;
  for (const category of categories) {
    if (!category.art) continue;
    fs.writeFileSync(path.join(CATEGORY_DIR, `${category.slug}.svg`), renderCategory(category), 'utf8');
    categoryCount += 1;
  }

  console.log(`Generated ${count} product images in ${PRODUCT_DIR}`);
  console.log(`Generated ${categoryCount} category images in ${CATEGORY_DIR}`);
}

main();
