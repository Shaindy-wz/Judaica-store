# 03 — Design Tokens

> **Language note:** The website UI and all content will be in **Hebrew** (RTL). Design tokens below are used across the Hebrew RTL site.

> These tokens are defined in `frontend/src/styles/variables.css` and referenced everywhere via `var(--token-name)`.
> **Never hardcode hex values or sizes inside components.** Always use the CSS Variable.
> Add new tokens only when a colour or value is genuinely missing (e.g. `--color-error`, `--color-overlay`) and only after verifying contrast ratios.

---

## Colour Palette

```css
:root {
  /* Primary — Navy (matches the פארך logo emblem blue) */
  --color-navy:        #113554;   /* Main navy — navbar, primary buttons */
  --color-navy-light:  #1f6895;   /* Hover state for navy elements */
  --color-navy-deep:   #04101f;   /* Deepest shade — hero overlays, shadows */

  /* Accent — Gold */
  --color-gold:        #b8973a;   /* Gold — decorations, borders, highlights */
  --color-gold-light:  #d4b05a;

  /* Background */
  --color-bg:          #f5f3ef;   /* Main site background — warm off-white */
  --color-white:       #ffffff;
  --color-surface:     #f0ede8;   /* Card backgrounds */

  /* Text */
  --color-text-primary:   #1a1a1a;
  --color-text-secondary: #555555;
  --color-text-muted:     #888888;

  /* UI */
  --color-border:      #e0ddd7;
  --color-success:     #2e7d32;
  --color-error:       #c0392b;   /* NEW — error states, out-of-stock messages */
  --color-whatsapp:    #25d366;
  --color-overlay:     rgba(0,0,0,0.35); /* NEW — used for Hero overlay and Modals */
}
```

### Accessibility Note (WCAG AA)
Any text placed on `--color-navy` or over a Hero overlay **must** achieve a contrast ratio of at least **4.5:1** against the background. This is a hard requirement. Use the [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify when in doubt. If a combination fails, adjust the overlay opacity or switch to a lighter text colour — never change the token values arbitrarily.

---

## Typography

```css
/* Primary font — classic serif */
@import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500;700;900&family=Heebo:wght@300;400;500;600&display=swap');

:root {
  --font-display: 'Frank Ruhl Libre', serif;   /* Large headings, titles */
  --font-body:    'Heebo', sans-serif;           /* Body text, nav, UI */

  /* Type scale */
  --text-xs:   0.75rem;    /*  12px */
  --text-sm:   0.875rem;   /*  14px */
  --text-base: 1rem;       /*  16px */
  --text-lg:   1.125rem;   /*  18px */
  --text-xl:   1.25rem;    /*  20px */
  --text-2xl:  1.5rem;     /*  24px */
  --text-3xl:  1.875rem;   /*  30px */
  --text-4xl:  2.25rem;    /*  36px */
  --text-hero: 3.5rem;     /*  56px — HeroBanner H1 only */
}
```

### Font Usage Rules
- `--font-display` → H1, H2, large section titles, HeroBanner headline
- `--font-body` → Everything else: paragraphs, nav links, buttons, form labels, product names

---

## Spacing, Radius & Shadows

```css
:root {
  /* Border radius */
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  12px;

  /* Shadows */
  --shadow-card:  0 2px 8px rgba(0,0,0,0.08);
  --shadow-hover: 0 4px 16px rgba(0,0,0,0.14);

  /* Transition */
  --transition: 0.2s ease;
}
```

---

## Usage Conventions

| Token | Where used |
|-------|-----------|
| `--color-navy` | Navbar background, primary button fill, section titles |
| `--color-gold` | Decorative borders, star ratings, accent underlines |
| `--color-bg` | Page background (`<html>` / `<body>`) |
| `--color-surface` | Product card background, sidebar panels |
| `--color-error` | Form validation errors, out-of-stock badges |
| `--color-whatsapp` | WhatsApp floating button background |
| `--color-overlay` | Hero image overlay, modal backdrop |
| `--shadow-card` | Default card shadow (ProductCard, CategoryCard) |
| `--shadow-hover` | Shadow on card hover state |
| `--transition` | All CSS `transition` values — e.g. `transition: box-shadow var(--transition)` |
| `--radius-md` | Product cards, buttons, form inputs |
| `--radius-lg` | Drawers, modal panels |
