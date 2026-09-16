# 01 — Project Overview & Tech Stack

> **Language note:** All specification files in `docs/specs/` are written in English for AI tooling.
> The final website — all UI text, content, labels, and RTL layout — will be developed in **Hebrew**.

---

## 1. Project Overview

| Field | Value |
|-------|-------|
| **Store name** | [To be confirmed by client — see Open Questions §20] |
| **Description** | An online Judaica store for Israeli religious consumers — Tzitzit, Tallitot, Tefillin, Mezuzot, holy books, lifecycle products, and more |
| **Language** | Hebrew (RTL layout throughout) |
| **Target audience** | Orthodox/traditional Israeli consumers and the broader Jewish world |
| **Goal** | A full-featured e-commerce site with professional UX, optimized for search and actual sales |

### Business Details
> The following must be filled in before launch (they appear in Terms of Service, Footer, contact pages, and legal notices):
- Full legal business name and registration number / business license number
- Registered business address
- Primary customer-service phone number (placeholder currently: `1-800-707-707`)
- Customer-service email address
- Does the business have physical branches? How many? Where? (see §20 Open Questions)

---

## 2. Executive Summary — What This Spec Covers

This spec describes a full-stack Hebrew e-commerce store. The frontend (components, pages, UX) integrates with a standard REST backend. The key additions compared to a "basic store" are features that will make the site stand out from competitors and serve customers better, **without introducing unnecessary complexity** that would block the site from functioning or performing well.

### Additional Features (beyond basic store)

1. **Admin Panel** — A dedicated management interface for adding/editing products, managing orders, and controlling all site content.
2. **Business-day delivery countdown** — Displays remaining business days (14 days), variant display for Judaica products, personalization notices, variant-based price display.
3. **Payment processing** — Integration with an Israeli payment gateway (Cardcom / PayPlus / Tranzila), no storage of card data on our server (PCI-DSS compliant).
4. **Invoice/receipt issuance** — The site must issue a receipt/invoice upon purchase; requires integration with Green Invoice / EZcount / iCount.
5. **Product reviews (Reviews)** — Google-style review widget (e.g. "6,708 people rated", star ratings, only verified buyers can submit).
6. **Product variant pricing** — Product page shows a price range of "₪239–₪449" with "choose options" button and "add to cart". Variant data (`specs.sizes` and description text) must not be stored as freeform text.
7. **Shabbat times (Zmanim)** — A widget at the bottom of the page, triggered from the navbar, opens a dedicated page on the site.
8. **Physical branch info with map** — Store page has branch address, hours, map, Waze/Google Maps links, and "accessible branch" notice.
9. **Blog & FAQ pages** — Two additional content pages visible at the top of the site.
10. **Gift cards (Gift Cards)** — Visible to site visitors, purchasable in various denominations.
11. **Basic SEO** — Meta tags, Structured Data, sitemap — all searchable by Google search results.
12. **Analytics** — Google Analytics + Meta Pixel (triggered only after cookie consent).
13. **Hebrew-normalised search** — The site must explicitly state: "You can search with or without niqqud/dagesh — the search finds both forms of your query."

### Deferred Features (not in initial build, don't implement)
- Product inventory management in DB (variants, quantities, low-stock alerts, restock, supplier purchase orders, etc.) — complex business logic, implemented after launch when the site is operational.
- Advanced filtering in search (number of items, colour chips, size dropdowns, number of reviews, price slider, etc.)
- Separate routing architecture for new sections (admin/, reviews/, search/, zmanim/ etc.)
- Footer with multiple columns of links (as shown in mockup) — only the bottom strip with legal links
- Displaying available delivery-option windows based on a calendar (no choosing specific date/time, no choosing pickup time slots)
- Build order (Build Order) planning that tracks sequential or parallel workstreams

### Still Needed (open questions remain)
- A list of **open questions** that must be answered before or immediately after development begins (store name, payment provider, invoicing service, branch addresses, etc.) — see §20.

---

## 3. Tech Stack

| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | React + Vite | Confirmed |
| Styling | CSS Modules + CSS Variables (no Tailwind) | Confirmed |
| Routing | React Router v6 | Confirmed |
| State | React Context API | Confirmed |
| Backend | Node.js + Express | Confirmed |
| DB | MongoDB + Mongoose | Confirmed |
| Auth | JWT (basic) + JWT with role field (extended) | **Decision pending** — see §15 |
| **Payments** | **Cardcom / PayPlus / Tranzila / Meshulam** (choose one — see §14) | **Requires "choose provider" decision** |
| **Invoice service** | **Green Invoice (API)** | Confirmed — implemented via `services/greenInvoiceService.js`; VAT registration status still pending confirmation with accountant |
| **Image hosting** | AWS S3 / Cloudinary (store images outside app server) | **Required** |
| **Email service** | `nodemailer` over generic SMTP (works with Resend / SendGrid / Brevo's SMTP relay, or any SMTP provider — just swap `.env` credentials) | Confirmed — implemented via `services/emailService.js` |
| **Shabbat times** | Hebcal API (free tier) | **Required** |
| **Analytics** | Google Analytics 4 + Meta Pixel | **Required** |
| **Search** | MongoDB text index + Hebrew normalisation on server (no Elasticsearch initially) | **Required** |
| Hosting | Single Render web service (Express serves the API **and** the built React app) · DB: MongoDB Atlas | Confirmed — see §Deployment |

---

## Deployment

The site is deployed as **one** Render web service. Express serves the JSON API
and the built React app from the same origin, so the browser calls `/api/...`
relatively — there is no second host to keep in sync and no CORS hop in
production.

| | |
|---|---|
| Build command | `npm run build` (installs both workspaces, then `vite build`) |
| Start command | `npm start` (runs `backend/src/server.js`) |
| Health check | `/api/products` |
| Blueprint | `render.yaml` at the repo root |

### How requests are routed

`backend/src/app.js` resolves each request in this order:

1. `/uploads/*` — admin-uploaded files on disk
2. `/api/*` — the routers; anything unmatched returns a **JSON** 404
3. static files from `frontend/dist`
4. any remaining `GET` — returns `index.html` so React Router can resolve the
   path client-side (this is what keeps a deep link working on refresh)

### Environment variables

Set these in the Render dashboard; `render.yaml` marks them `sync: false` so no
secret is ever committed.

| Variable | Production value |
|---|---|
| `MONGODB_URI` | the Atlas SRV string |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | the deployed origin — accepts a comma-separated list |
| `PORT` | **do not set**; Render injects it |

`JWT_SECRET`, the `SMTP_*` block and the `GREEN_INVOICE_*` block carry the same
meaning as in local development. See `backend/.env.example`.

### Why `frontend/.env.production` is committed

`frontend/.env` is gitignored and holds `VITE_API_URL=http://localhost:5000/api`
for local dev. Vite inlines that value at build time, so without an override the
production bundle would ship pointing at the visitor's own machine.
`.env.production` pins `VITE_API_URL=/api`, which takes precedence over `.env`
during `vite build` and keeps the bundle host-agnostic. It contains no secrets.

### Seeding a fresh database

Atlas starts empty. Run the seed against it once — the scripts upsert by
slug/code, so they are safe to re-run and never delete admin-entered data:

```bash
MONGODB_URI="<atlas-uri>" npm run seed:demo
```
