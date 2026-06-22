# 09 — Styling, RTL Layout, Responsive Breakpoints & Footer

> **Language note:** The website is a **Hebrew** (RTL) site. All CSS must treat right-to-left as the default direction. Never override with `direction: ltr` unless absolutely necessary for a specific isolated widget.

---

## Global CSS (`styles/globals.css`)

```css
/* styles/globals.css */
*, *::before, *::after { box-sizing: border-box; }

html {
  direction: rtl;               /* RTL is the baseline for the entire site */
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--color-text-primary);
  background: var(--color-bg);
}

body { margin: 0; }

a { text-decoration: none; color: inherit; }

img { max-width: 100%; display: block; }

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Section titles — used across the site for consistent heading styling */
.section-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-navy);
  margin-bottom: 24px;
}

/* Accessibility: visible focus ring — do not remove or override */
:focus-visible {
  outline: 3px solid var(--color-gold);
  outline-offset: 2px;
}

/* Accessibility: respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Critical CSS Rules
1. **`direction: rtl` on `<html>`** — this is the single RTL declaration. Never set it per-component. Never duplicate it.
2. **`:focus-visible` must never be removed** — it is required for keyboard navigation and WCAG compliance (see §10).
3. **`prefers-reduced-motion`** — must remain to support users with vestibular disorders.
4. Do not add `@import` statements for fonts inside this file if they are already imported via `<link>` in `index.html`. Pick one approach and stick to it.

---

## CSS Variables (`styles/variables.css`)

All design tokens are in this file only. See full token list in `docs/specs/03-design-tokens.md`.

**Rule:** No component file may hardcode a hex colour value, a pixel size for font/spacing, or a raw `rgba()` that duplicates a token. Always reference via `var(--token-name)`.

---

## RTL-Specific CSS (`styles/rtl.css`)

This file handles edge cases where CSS does not automatically flip for RTL, particularly:
- Third-party libraries that use `left`/`right` instead of `inline-start`/`inline-end`
- Absolutely-positioned elements that need explicit mirroring
- Icons that are directional (e.g. arrows, chevrons) that need `transform: scaleX(-1)` in RTL

**Rule:** Never add RTL overrides inside component `.module.css` files. All global RTL adjustments go here.

---

## Responsive Breakpoints

Mobile-first approach. Breakpoints:

```css
/* Mobile (default — no media query) */
/* sm */  @media (min-width: 640px)  { ... }
/* md */  @media (min-width: 768px)  { ... }
/* lg */  @media (min-width: 1024px) { ... }
/* xl */  @media (min-width: 1280px) { ... }
```

### ProductGrid Column Counts

| Viewport | Columns |
|---------|---------|
| Mobile (< 640px) | 2 |
| Tablet (768px) | 3 |
| Desktop (1024px+) | 4 |

### CategoryGrid Column Counts

| Viewport | Columns |
|---------|---------|
| Mobile (< 640px) | 2 |
| Desktop (1024px+) | 4–7 (confirm with client based on number of top-level categories) |

---

## Footer

**File:** `components/layout/Footer.jsx`

### Five-Column Layout (collapse to accordion on mobile)

| Column | Contents |
|--------|---------|
| About | Logo + short brand description + social media icons |
| Categories | Links to main product categories |
| Customer Service | Contact / FAQ / Blog |
| Contact Info | Address / Phone / Opening hours / Branch links |
| **Legal (NEW)** | **Terms of Service / Privacy Policy / Accessibility Statement / Shipping & Returns Policy** |

### Footer Bottom Strip (always visible)
- `© [Year] [Store Name]. All rights reserved`
- Social media icons (Instagram, Facebook)
- **Legal info (NEW — required by Israeli Consumer Law):** Full legal business name + registration number / business license + registered address
- **Marketing consent checkbox (NEW):** "I agree to receive promotional marketing" (opt-in only — see §10 on marketing consent)

### Footer Rules
- All legal pages must be linked from the Footer Legal column
- The legal business name and registration number are mandatory in the footer (Israeli Consumer Protection Law requirement)
- The marketing consent checkbox must default to **unchecked** (opt-in, not opt-out)
- The "Branches" column/link in the Footer should only appear if the business has physical branches (see Open Questions §20)
