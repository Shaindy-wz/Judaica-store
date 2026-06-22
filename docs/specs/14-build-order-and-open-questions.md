# 14 — Build Order & Open Questions

---

## 19. Recommended Build Order (30 Steps)

> This order is optimised to avoid blocking dependencies. Complete each phase before starting the next. Steps within a phase can often be worked in parallel.

### Phase 1 — Foundation
1. **Project setup:** Vite + React + React Router v6, folder structure per §2
2. **CSS foundation:** CSS Variables (`variables.css`) + `globals.css` + RTL (`html { direction: rtl }`) + `:focus-visible` accessibility
3. **Layout shell:** TopBar → Header → Footer → `Layout` wrapper component
4. **Global Context providers:** `CartContext` + `AuthContext` + `SearchContext` — wired into `App.jsx`

### Phase 2 — Core Customer Pages
5. **UI primitives:** `Button`, `Badge`, `StarRating`, `Breadcrumb` components
6. **Home page:** `HeroBanner` → `QuickCategoryStrip` → `CategoryGrid` → `NewArrivalsStrip` → `FeaturedProducts`
7. **Category page:** `CategoryPage` + `ProductGrid` + `Pagination`
8. **Product page:** `ProductPage` + `ProductGallery` + `ProductDetails` + `ProductOptions` (variant system) + `ProductPriceRange`
9. **Cart flow:** `CartDrawer` + `CartItem` + `CartSummary` + `CouponInput`

### Phase 3 — Auth & Account
10. **Auth UI:** Login / Register forms (frontend only, mock API)
11. **Account pages:** `AccountPage` tabs (profile, orders, addresses, preferences)
12. **Backend setup:** Express app → route files → controllers → Mongoose models (start with `Product` with full variant schema)
13. **Connect frontend to backend:** wire `productService`, `categoryService`, `authService` to real API endpoints

### Phase 4 — Payments & Critical Legal (do this before launch — requires provider decisions)
14. **Choose payment provider** (see §14.1, §20) → implement `PaymentFrame` + `POST /api/payments/create-session` + webhook handler
15. **Invoicing service integration** (Green Invoice / EZcount / iCount) — triggered from webhook
16. **Legal pages:** `/terms`, `/privacy-policy`, `/accessibility-statement`, `/shipping-returns` (static content, needs lawyer review)
17. **AccessibilityWidget** + `CookieConsentBanner` + baseline accessibility audit (contrast, alt text, focus rings)

### Phase 5 — Feature Modules
18. **Reviews:** `Review` model + API endpoints + `ReviewList` + `ReviewForm` + `ReviewSummary` + admin moderation
19. **Shabbat Times:** `zmanimService.js` (Hebcal API) + `ShabbatTimesWidget` + `ShabbatTimesPage`
20. **Search:** `SearchOverlay` + `hebrewSearchNormalize.js` + `searchTokens` field on Product + `GET /api/search` endpoint
21. **Branches page:** `BranchList` / `BranchCard` / `BranchMap` (only if business has branches — see §20) + Blog + FAQ

22. **Gift cards:** `GiftCardPage` + `GiftCard` model + API + CartDrawer gift card redemption field

### Phase 6 — Admin Panel
23. **Admin:** separate login page + auth guard (`ProtectedAdminRoute`)
24. **Admin:** Product CRUD — full form with variant matrix, `ImageUploader`
25. **Admin:** Order management, coupon management, review moderation, customer list

### Phase 7 — Polish & Launch Prep
26. **WhatsApp button** + `ReviewsWidget` (floating homepage widget)
27. **SEO:** meta tags (react-helmet), JSON-LD structured data, `sitemap.xml` generation, `robots.txt`
28. **Analytics:** GA4 + Meta Pixel (gated behind cookie consent)
29. **Responsive polish:** test all breakpoints (mobile 375px, tablet 768px, desktop 1280px)
30. **End-to-end flow test:** Add to cart → coupon → checkout → payment → webhook → invoice → confirmation email → admin order view → mark shipped → customer email

---

## 20. Open Questions (Must Be Answered Before or During Development)

The following questions need business decisions before the relevant parts of the system can be built. Open questions are listed here, not scattered through the codebase.

| # | Question | Affects |
|---|---------|---------|
| 1 | **Store name** — what is the legal registered name? | Header logo, all meta titles, legal footer text, org schema |
| 2 | **Payment provider** — Cardcom / PayPlus / Tranzila / Meshulam / other? | All of §11 payment implementation |
| 3 | **Invoicing service** — Green Invoice / EZcount / iCount / other? (confirm with accountant) | §11 invoicing integration |
| 4 | **Physical branches** — does the business have branches? How many? Addresses, hours, phones? | BranchesPage, TopBar/Footer "Branches" link, BranchMap |
| 5 | **Product images** — does the client have professional photos, or does this need to be arranged? | ImageUploader, S3/Cloudinary setup, hero image |
| 6 | **Product catalogue** — is there an existing inventory list (Excel, CSV, another platform)? | Data migration plan, Category tree structure, time to populate DB |
| 7 | **Shipping providers** — who handles shipping? Costs? Thresholds for free shipping? | ShippingForm, CartSummary, PromoStrip copy |
| 8 | **Gift cards** — digital only, or also physical cards that need to be shipped? | GiftCardPage flow, shipping integration |
| 9 | **Additional language** — is there a requirement for English or any other language now or in the near future? | Routing, DB text fields, i18n architecture |
| 10 | **Hosting preference** — is there an existing hosting provider, or shall we proceed with Vercel/Render/MongoDB Atlas as suggested in §3? | Infrastructure setup, deployment pipeline |
| 11 | **Timeline & budget constraint** — is there a target launch date? Does it affect prioritisation of phases 1–4 vs 5–7 (core store vs gift cards/blog/branches)? |
