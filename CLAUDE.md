# CLAUDE.md — Global Project Instructions

This file is the authoritative system prompt for all AI-assisted development on this project.
Read this file at the start of every session and before writing any code.

---

## Project Identity

**Type:** Full-stack Hebrew e-commerce store (Judaica / religious items)
**Project root:** `Judaica-store/` — this is the git repository root. All paths in this file are relative to it.
**Stack:** React + Vite (frontend) | Node.js + Express (backend) | MongoDB + Mongoose (DB)
**Language:** The website UI, all content, and all user-facing text are in **Hebrew (RTL)**.
All specification files in `docs/specs/` are written in English for tooling purposes.

---

## Rule 1 — Read the Spec Before Writing Code

Before writing a single line of code for any task, locate and read the relevant specification file in `docs/specs/`.

| Working on... | Read this spec file |
|--------------|-------------------|
| Project structure, new files/folders | `02-file-structure.md` |
| Colours, fonts, spacing, CSS variables | `03-design-tokens.md` |
| Any UI component | `04-frontend-components.md` |
| Any page or route | `05-routing-and-pages.md` |
| CartContext / AuthContext / SearchContext | `06-state-management.md` |
| Any API endpoint | `07-api-endpoints.md` |
| Any Mongoose model | `08-database-models.md` |
| CSS, RTL, responsive, Footer | `09-styling-rtl-responsive.md` |
| Consumer rights, accessibility, privacy, PCI-DSS | `10-legal-and-compliance.md` |
| Payment flow, invoicing, emails, coupons | `11-payments-and-invoicing.md` |
| Admin panel | `12-admin-panel.md` |
| Meta tags, structured data, sitemap, analytics | `13-seo-and-analytics.md` |
| Build order or open questions | `14-build-order-and-open-questions.md` |

**Do not guess requirements.** If a requirement is unclear, check the spec first, then ask.

---

## Rule 2 — Code Quality Standards

### React / Frontend
- Use **Functional Components** and **React Hooks** only. No class components.
- Access global state via the exported hooks (`useCart`, `useAuth`, `useSearch`), never import Context directly in components.
- Never call `fetch` or `axios` directly in a component. All API calls go through the `services/` layer.
- Every `<img>` must have a meaningful `alt` attribute. Decorative images use `alt=""`.
- Every icon-only `<button>` must have `aria-label`.
- Every `<input>` must have an associated `<label>` (or `aria-label`).
- Use `<form>` HTML elements with `onSubmit` handlers — never a `<div>` with an `onClick` to submit a form.

### CSS / Styling
- Never hardcode hex colours, pixel sizes, or `rgba()` values in component CSS. Always use `var(--token-name)`.
- All global CSS tokens live in `styles/variables.css`. Do not duplicate tokens in component files.
- RTL is declared once on `<html direction="rtl">`. Never override per-component unless absolutely necessary.
- Do not remove or override `:focus-visible` — it is a legal accessibility requirement.
- Do not remove `@media (prefers-reduced-motion: reduce)` — it is an accessibility requirement.

### Backend / API
- All routes under `/api/admin/*` must go through the `adminOnly` middleware before the handler.
- Never update `Order.status` to `'paid'` from the frontend or from any source other than the verified payment webhook.
- Validate webhook request signatures/HMAC before processing any payment event.
- Never store, transmit, or log raw card numbers or CVV codes. All card collection uses the payment provider's iframe/Hosted Fields.

### Error Handling
- All API calls in `services/` must handle loading and error states and return them to the component.
- Components must render a visible loading indicator and a user-friendly error message for all async operations.

---

## Rule 3 — Variant System (Critical)

The `specs.sizes: [String]` freeform field **does not exist**. It was replaced with structured variants.

**When building any product-related feature:**
- Products with options use `Product.options` (array of option dimensions) and `Product.variants` (array of option combinations with price/sku/stock per combination).
- `ProductOptions.jsx` renders a button-group selector per option dimension.
- `ProductCard` shows a price range ("₪239 – ₪449") if `maxPrice` is provided; button shows "Choose Options" if `hasVariants: true`.
- See `04-frontend-components.md §5.10` and `08-database-models.md` for the full schema.

---

## Rule 4 — Hebrew Normalisation for Search

The search system must handle Hebrew with and without niqqud/dagesh. This is a documented user-facing feature.

- `utils/hebrewSearchNormalize.js` exports `normalizeHebrew(text)` — strip all diacritics via Unicode NFD decomposition + regex.
- Apply `normalizeHebrew` both in `searchService.js` (client side) before sending the query and in the backend search route before querying MongoDB.
- Each Product document stores a `searchTokens: [String]` array with normalised variants of its name. This is populated on save/update.

---

## Rule 5 — RTL is the Default

This is a Hebrew website. RTL layout is the default, not an option.

- `<html direction="rtl">` is set in `globals.css` — never remove or conditionally override it.
- When using absolute/fixed positioning, use `right` instead of `left` for RTL-native elements (or use `inset-inline-end` / `inset-inline-start` for logical properties).
- When importing third-party CSS, check if it assumes LTR and add RTL overrides to `styles/rtl.css` — not inside component files.

---

## Rule 6 — Accessibility is Non-Negotiable

Accessibility is a legal requirement in Israel (Equal Rights for Persons with Disabilities Act, 2013).

- Never disable `:focus-visible` outlines.
- All contrast ratios for text must meet WCAG 2.1 AA (4.5:1 for normal text).
- Do not remove `aria-*` attributes from components — add them where missing.
- `AccessibilityWidget.jsx` must always be present on all customer-facing pages.
- The `/accessibility-statement` page is legally required and must be linked from the Footer.

---

## Rule 7 — Legal Requirements Baked Into Components

The following components exist specifically to satisfy Israeli legal requirements. Do not remove or skip them:

| Component | Legal requirement |
|-----------|------------------|
| `CancellationRightsNotice` | Consumer Protection Law — 14-day cancellation rights |
| `ReturnPolicyNotice` | Must show per-product return policy (holy items / personalised items non-returnable) |
| `CookieConsentBanner` | Privacy Authority best-practice; must gate GA4 + Meta Pixel |
| `AccessibilityWidget` + `/accessibility-statement` | Accessibility Regulations 2013 |
| Footer legal text | Consumer Protection Law — legal business name + registration number required |
| Marketing consent checkbox | Must default to unchecked (opt-in, not opt-out) |

---

## Rule 8 — Admin Panel Isolation

The Admin Panel is a completely separate sub-application.

- Admin routes (`/admin/*`) must not share layout components with the customer site.
- `ProtectedAdminRoute.jsx` checks the JWT for `role: 'admin'` before rendering any admin page.
- All admin API routes are under `/api/admin/*` and require the `adminOnly` middleware on the server.
- Admin login is at `/admin/login` — completely separate from customer `/account/login`.
- Never expose admin-level data (stock quantities, profit margins, customer PII) through customer-facing API endpoints.

---

## Rule 9 — Documentation Updates

These spec files and this `CLAUDE.md` are living documents.

**When any of the following happens, update the relevant spec file immediately:**
- A new technology is added to the stack (update `01-overview-and-stack.md`)
- The file structure changes significantly (update `02-file-structure.md`)
- A DB model field is added, renamed, or removed (update `08-database-models.md`)
- A new API endpoint is added or an existing one changes its contract (update `07-api-endpoints.md`)
- An open question from `14-build-order-and-open-questions.md` is answered — mark it resolved and move the decision into the relevant spec file

**Do not let the documentation drift from the actual codebase.**

---

## Quick Reference: Design Tokens

```
--color-navy: #1a2b4a    --color-gold: #b8973a    --color-bg: #f5f3ef
--font-display: 'Frank Ruhl Libre'    --font-body: 'Heebo'
--radius-md: 8px    --shadow-card: 0 2px 8px rgba(0,0,0,0.08)
--transition: 0.2s ease
```

Full token list: `docs/specs/03-design-tokens.md`

---

## Quick Reference: Build Phase Order

1. Foundation (Vite, CSS, Layout, Contexts)
2. Core customer pages (Home, Category, Product, Cart)
3. Auth & Account + Backend wiring
4. Payments + Legal pages + Accessibility (required before launch)
5. Feature modules (Reviews, Shabbat times, Search, Branches, Blog, Gift cards)
6. Admin panel
7. SEO, Analytics, Responsive polish, End-to-end testing

Full 30-step order: `docs/specs/14-build-order-and-open-questions.md`
