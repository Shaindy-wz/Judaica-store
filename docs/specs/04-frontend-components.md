# 04 — Frontend Components

> **Language note:** All UI text, labels, and copy in the components will be in **Hebrew** (RTL). Component names and code are in English.

---

## 5.1 TopBar

**File:** `components/layout/TopBar.jsx`

**Behaviour:**
- Left side: "Contact Us" | "Branches"
- Right side: phone icon + number `1-800-707-707` as a clickable `tel:` link
- Background: `var(--color-navy)` | white text | height: 36px
- Hidden on mobile (collapsed)

```jsx
// TopBar.jsx
export default function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar__left">
        <a href="/contact">צור קשר</a>
        <span>|</span>
        <a href="/branches">סניפים</a>
      </div>
      <div className="topbar__right">
        <PhoneIcon />
        <a href="tel:1800707707">1-800-707-707</a>
      </div>
    </div>
  );
}
```

---

## 5.2 Header / Navbar

**Files:** `components/layout/Header.jsx` + `Navbar.jsx`

### Layout
```
[Logo — left]  [Nav items — centre]  [Icons: cart + account + search — right]
```

### Navigation Items (with sub-menus)
- Tzitzit ▾
- Tallitot ▾
- Tefillin ▾
- Mezuzot ▾
- Lifecycle Events ▾
- General ▾
- Shabbat Items ▾
- Branches ▾
- Contact ▾

> **Spec note:** The "Contact" sub-menu contains: "FAQ", "Blog", "Shabbat Times" (see §6.7–6.9). The "Branches" sub-menu contains a link to the full branches page or a city preview if there are only a few locations (depends on business data).

### Functional Details
- Sub-menus open as dropdown overlays on hover (▾), with keyboard focus support and proper `aria` attributes
- Header is **sticky** (stays at top) below the TopBar
- Mobile: hamburger icon → slide-in drawer menu on the left
- Search: icon opens `SearchOverlay` with auto-focus + placeholder "Search products on the site…" + message "You can search with or without niqqud/dagesh — the search finds both forms" (see §5.13)
- Cart: badge with item count; if empty, show "Your cart is empty." message

```jsx
const menuItems = [
  { label: 'ציציות', href: '/c/tzitzit', children: [...] },
  { label: 'טליתות', href: '/c/prayer-shawls', children: [...] },
  { label: 'תפילין', href: '/c/tefillin', children: [...] },
  { label: 'מזוזות', href: '/c/mezuzot', children: [...] },
  { label: 'מעגל החיים', href: '/c/lifecycle', children: [...] },
  { label: 'כללי', href: '/c/general', children: [...] },
  { label: 'שבת ומועד', href: '/c/shabbat', children: [...] },
  { label: 'סניפים', href: '/branches', children: [...] },
  { label: 'קשר', href: '/contact', children: [
    { label: 'שאלות ותשובות', href: '/faq' },
    { label: 'בלוג', href: '/blog' },
    { label: 'זמן כניסת ויציאת שבת', href: '/shabbat-times' },
  ]},
];
```

### Visual Specs
- White background with bottom border: `1px solid var(--color-border)`
- Logo: vertically centered, max-height 50px
- Header height: 70px

---

## 5.3 HeroBanner

**File:** `components/home/HeroBanner.jsx`

### Visual Layout
- Full-width background image (hero image) of Tallit or Tefillin
- Text overlay content:
  - **Main headline:** `[Store Name]` — font: Frank Ruhl Libre, 3.5rem, white colour
  - **Sub-headline:** "Quality Judaica for the Jewish home — Tallitot, Tzitzit, Tefillin, Mezuzot and more" — 1.1rem, white, opacity 90%
- Two CTA buttons:
  - "Shop Now" → `/shop` — bg: `var(--color-navy)` | white text | padding: 12px 32px
  - "About Us" → `/about` — border only | white text | transparent bg
- `min-height: 80vh`
- Overlay colour: `var(--color-overlay)` over the background image

```jsx
export default function HeroBanner() {
  return (
    <section className="hero" style={{ backgroundImage: 'url(/assets/images/hero.jpg)' }}>
      <div className="hero__overlay" />
      <div className="hero__content">
        <h1 className="hero__title">[שם החנות]</h1>
        <p className="hero__subtitle">תשמישי קדושה באיכות ישראלית...</p>
        <div className="hero__actions">
          <Button href="/shop" variant="primary">קנה עכשיו</Button>
          <Button href="/about" variant="outline-light">אודותינו</Button>
        </div>
      </div>
    </section>
  );
}
```

---

## 5.3a QuickCategoryStrip (NEW)

**File:** `components/home/QuickCategoryStrip.jsx`

**Purpose:** Appears directly below the Hero (a few pixels below the fold) and renders a horizontal strip of quick-link text buttons for major categories: Tallitot | Tzitzit | Mezuzot | Tefillin | Kippot | Wicks | Shabbat | Bags | Siddurim. This is a convenience strip, not a replacement for `CategoryGrid` which appears further down the page.

```jsx
const quickLinks = [
  { label: 'טליתות', href: '/c/prayer-shawls' },
  { label: 'ציציות', href: '/c/tzitzit' },
  { label: 'מזוזות', href: '/c/mezuzot' },
  { label: 'תפילין', href: '/c/tefillin' },
  { label: 'כיפות', href: '/c/kippot' },
  { label: 'פתילות', href: '/c/wicks' },
  { label: 'שבת', href: '/c/shabbat' },
  { label: 'תיקים', href: '/c/talit-tefillin-covers' },
  { label: 'סידורים', href: '/c/siddurim' },
];
```

---

## 5.4 CategoryGrid

**File:** `components/home/CategoryGrid.jsx`

**Layout:**
- Grid of 4 columns (mobile: 2)
- Each card: square image + category name below
- Hover: slight zoom-in + shadow
- Categories displayed: Tzitzit | Tallitot | Tefillin | Mezuzot | Holy Books | Lifecycle Events | Shabbat Items | Tefillin Bags

```jsx
const categories = [
  { id: 1, name: 'ציציות', slug: 'tzitzit', image: '/assets/categories/tzitzit.jpg' },
  { id: 2, name: 'טליתות', slug: 'talit', image: '/assets/categories/talit.jpg' },
  // ...
];

export default function CategoryGrid() {
  return (
    <section className="category-grid">
      <h2 className="section-title">קטגוריות</h2>
      <div className="category-grid__items">
        {categories.map(cat => (
          <a key={cat.id} href={`/category/${cat.slug}`} className="category-card">
            <img src={cat.image} alt={cat.name} />
            <span className="category-card__name">{cat.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
```

---

## 5.4a NewArrivalsStrip (NEW)

**File:** `components/home/NewArrivalsStrip.jsx`

**Purpose:** A section labelled "New Arrivals" near the top of the home page — shown on the site: title + sub-title "We're always adding new items" + "See All" link (points to `/shop?sort=newest`) + horizontal scroll of `ProductCard` components with a "New" badge on each card (4–8 products, sorted by `createdAt` descending).

---

## 5.5 ProductCard

**File:** `components/product/ProductCard.jsx`

> **Important spec note (updated from original):** Added variant/option support. The button changes depending on product type: "Add to Cart" for simple products, "Choose Options" for products with multiple variants (see §5.10 for the variant system).

### Props

```ts
{
  id: string
  name: string
  price: number              // Lowest price (base price if no variants, lowest variant price otherwise)
  maxPrice?: number          // Optional — if present, display range "₪239 – ₪449"
  originalPrice?: number     // Original (pre-sale) price
  hasVariants: boolean       // Determines whether button shows "Add to Cart" or "Choose Options"
  image: string
  badge?: string             // "New" | "Sale" | "Popular"
  rating?: number            // Optional — average rating
  reviewCount?: number       // Optional
  slug: string
}
```

### Visual Layout
- White card with `border-radius: var(--radius-md)` and `var(--shadow-card)`
- Square product image at top
- Badge (if present) — top-left corner
- Product name: bold, 1rem
- Star rating below name (if `rating` present) — NEW
- Price: `var(--color-navy)`, 1.1rem; original price in gray strikethrough; if `maxPrice` provided → display "₪{price} – ₪{maxPrice}"
- On hover: button "Add to Cart" / "Choose Options" slides up with transition

```jsx
export default function ProductCard({ id, name, price, maxPrice, originalPrice, hasVariants, image, badge, rating, reviewCount, slug }) {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      {badge && <span className="product-card__badge">{badge}</span>}
      <a href={`/product/${slug}`}>
        <img src={image} alt={name} className="product-card__image" />
      </a>
      <div className="product-card__info">
        <h3 className="product-card__name">{name}</h3>
        {rating && <StarRating value={rating} count={reviewCount} size="sm" />}
        <div className="product-card__price">
          {maxPrice ? (
            <span className="price-current">₪{price} – ₪{maxPrice}</span>
          ) : (
            <>
              <span className="price-current">₪{price}</span>
              {originalPrice && <span className="price-original">₪{originalPrice}</span>}
            </>
          )}
        </div>
      </div>
      {hasVariants ? (
        <a href={`/product/${slug}`} className="product-card__add-btn">בחר אפשרויות</a>
      ) : (
        <button className="product-card__add-btn" onClick={() => addToCart({ id, name, price, image })}>
          הוסף לסל
        </button>
      )}
    </div>
  );
}
```

---

## 5.6 CategoryPage

**File:** `pages/CategoryPage.jsx`

### Layout
```
[Breadcrumb: Home / Shop / Tallitot]
[Category banner — navy background + category name centred]
[Sub-categories grid — "Sub-Categories" shown above grid]
[ProductGrid — product listing]
[Pagination]
```

### Sub-categories (example for Tallitot)
- Hand-woven Tallit | Wool Tallit | Machine-woven Tallit | Cotton Tallit | Satin Tallit | 100% pure silk Tallit (imported) | Tallit for children

### Breadcrumb
```jsx
<nav className="breadcrumb">
  <a href="/">דף הבית</a>
  <span>/</span>
  <a href="/shop">חנות</a>
  <span>/</span>
  <span>טליתות</span>
</nav>
```

> **Spec note:** Categories on the site can have up to 3 depth levels (example: Mezuzot → Wooden Mezuzah Cases → up to 10cm cases). The `Category` model (§9) stores a multi-level tree; the Breadcrumb reconstructs the ancestry chain via `parent` references.

---

## 5.7 CartDrawer

**File:** `components/cart/CartDrawer.jsx`

**Layout:**
- Slide-in drawer from the right
- Item list: thumbnail + name + price + quantity controls (+/-) + remove button
- Coupon code input section (`CouponInput.jsx` — NEW)
- Footer: subtotal + "Checkout" button
- Semi-transparent overlay outside drawer closes it on click
- Empty state: "Your cart is empty." + "Continue Shopping" button

---

## 5.8 WhatsAppButton

**File:** `components/ui/WhatsAppButton.jsx`

**Layout:**
- Fixed floating button, bottom-right corner
- Background: `var(--color-whatsapp)` — green
- WhatsApp icon + text "Chat with us on WhatsApp"
- Opens `wa.me` link with the business phone number in a new tab

```jsx
export default function WhatsAppButton() {
  return (
    <a href="https://wa.me/972XXXXXXXXX" target="_blank" rel="noopener noreferrer" className="whatsapp-btn">
      <WhatsAppIcon />
      <span>שוחח איתנו בוואטסאפ</span>
    </a>
  );
}
```

---

## 5.9 ReviewsWidget (homepage widget)

**File:** `components/home/ReviewsWidget.jsx`

**Layout:**
- Fixed widget at bottom-left corner of the page (`position: fixed`)
- Shows: average rating (out of 5 stars), total review count ("X people rated"), a "Reviews" label
- On click: opens a floating panel / modal with the full review list
- Data fetched from `GET /api/reviews/summary` (see §8)

---

## 5.10 ProductOptions / Product Variants (NEW — critical)

**File:** `components/product/ProductOptions.jsx`

> **Critical spec note:** `specs.sizes: [String]` was a freeform text array — this is **replaced** entirely. The site will manage structured variants (Colour × Finish × Size etc.) as explicit structured data. Products with variants display a price range ("₪239 – ₪449") and a "Choose Options" button.

### Data Structure on Product

```ts
variants: [
  {
    id: string,
    optionValues: { color?: string, finish?: string, size?: string },
    price: number,
    sku: string,
    inStock: boolean,
    stockQuantity?: number,
  }
]
options: [          // Ordered list of dimension names and their possible values — drives the UI
  { name: 'צבע', values: ['לבן', 'שחור-לבן'] },
  { name: 'גימור', values: ['פתילות עבודת יד', 'פתילות עבודת מכונה'] },
]
```

### Rendering Rules
- Render a group of selector buttons (not dropdown) for each option dimension, as seen on the main store
- A user must select a value for every option before `ProductDetails` enables the "Add to Cart" button
- If the user has not yet selected all options → the button shows "Choose Options" and is not active
- When all options selected → resolve the matching variant, update the displayed price and SKU

---

## 5.11 Reviews Module (NEW)

**Files:** `components/reviews/ReviewList.jsx`, `ReviewForm.jsx`, `ReviewSummary.jsx`

**Purpose:** Replaces the Google-style review widget. The Widget at the bottom corner of the page shows the store-wide average (pulled from `GET /api/reviews/summary`). Per-product reviews appear on the product page.

- **ReviewSummary** — Shows the average rating + total count + star-breakdown histogram (5★ = nn, 4★ = nn…)
- **ReviewList** — List of approved reviews: reviewer name (or "Anonymous"), date, comment, tag "Verified Purchase" if verified
- **ReviewForm** — Displayed **only** to logged-in users who have purchased the item (site copy: "Only registered users who have purchased the item or won a prize may rate it")
- New reviews are held in `status: 'pending'` and require admin approval/rejection before appearing on the site (see §15)

---

## 5.12 ShabbatTimesWidget / Shabbat Times Page (NEW)

**Files:** `components/home/ShabbatTimesWidget.jsx`, `pages/ShabbatTimesPage.jsx`, `services/zmanimService.js`

**Purpose:** A widget at the bottom of the home page and a linked page from the nav "Shabbat Entry/Exit Times" (see §5.2). Integration details:
- Uses **Hebcal API** (free, no API key required): `https://www.hebcal.com/shabbat?cfg=json&geonameid=...`
- UI: city selector (Jerusalem / Tel Aviv as defaults), with option for the user to type a different city
- Displays: Shabbat entry time (candle lighting), Shabbat exit time (Havdalah), nearest Jewish holiday if applicable
- The homepage Widget is a compact version (links to the full page)

---

## 5.13 SearchOverlay + Hebrew Search Normalisation (NEW)

**Files:** `components/ui/SearchOverlay.jsx`, `utils/hebrewSearchNormalize.js`, `backend/src/routes/search.js`

**Purpose:** The spec explicitly states that searching "with or without niqqud/dagesh" must both return results — i.e. "תפילין" and "תפלין" return identical results.

```js
// utils/hebrewSearchNormalize.js
// Remove niqqud and dagesh diacritics so searches without vowel marks
// still match stored product names that may include them.
// Do NOT use "with diacritics" or "without diacritics" as separate indexes.
export function normalizeHebrew(text) {
  return text
    .normalize('NFKD')
    .replace(/[֑-ׇ]/g, '')      // Remove all Hebrew diacritics (niqqud + cantillation)
    .replace(/['"]/g, '')                  // Remove geresh / gershayim marks
    .trim()
    .toLowerCase();
}
```

On the server side, a `searchTokens` array field is stored on each Product document containing all normalised variant forms of the product name (with/without niqqud), so that a MongoDB text index query returns results for both forms.

**UX:** The search overlay opens when the user clicks the search icon. Results appear after 2+ characters are typed. Placeholder text: "Search products on the site…" visible on empty state.

---

## 5.14 GiftCardPage (NEW)

**File:** `pages/GiftCardPage.jsx`

**Purpose:** Allows purchasing digital gift cards in selectable denominations (visible to all site visitors).

**Required features:**
- Amount selector (₪100–₪1000, or a free-text amount)
- Fields "Recipient Name" + recipient email for sending + optional personal message
- Payment flow: creates a unique code that is emailed to the recipient
- Redemption: "Do you have a gift card code?" field in CartDrawer/Checkout that deducts the amount from the total

> **Open question for client:** Do physical gift cards need to be shipped, or only digital? Does this affect the shipping flow? Does it affect the DB schema or just the frontend experience?

---

## 5.15 CookieConsentBanner (NEW)

**File:** `components/layout/CookieConsentBanner.jsx`

**Purpose:** A bottom/top banner that appears on first visit, informing the user that the site uses tracking cookies (Google Analytics, Meta Pixel) and requesting consent with an "Accept/Decline" button. This is not strictly required by GDPR (Israel is not EU), but is best practice as recommended by Israeli Privacy Authority guidelines.

---

## 5.16 AccessibilityWidget (NEW — legal requirement)

**File:** `components/layout/AccessibilityWidget.jsx`

**Purpose:** A floating button (similar in style to the WhatsApp button) that opens an accessibility panel with options: increase/decrease font size, high contrast mode, link highlighting, stop animations, readable font. This widget is **not a guarantee of full compliance** on its own — it supplements the core accessibility work described in §10. It is a legal and de-facto industry norm in Israel.

---

## 5.17 BranchList / BranchCard / BranchMap (NEW)

**Files:** `components/branches/BranchList.jsx`, `BranchCard.jsx`, `BranchMap.jsx`

**Purpose:** Based on business data, renders branch information. Each branch card shows:
- Branch name (city + street)
- Full address
- Phone number (`tel:` link)
- Opening hours (per day of the week, or free-text per branch)
- "Google Maps" and "Waze" navigation links (open in native apps on mobile)
- "Accessible branch" badge where applicable

Branches are grouped by city (`##` headers per city), and the page optionally embeds a Google Maps iframe showing all branch pins.

---

## 5.18 BlogList / BlogPostCard (NEW)

**Files:** `components/blog/BlogList.jsx`, `BlogPostCard.jsx`

**Purpose:** Renders a list of blog posts (title, cover image, excerpt, date) each linking to its full post. The blog is primarily for SEO purposes and long-form content marketing (example post titles: "How to choose a Tallit for a Bar Mitzvah — what to look for" — as per the original spec). Blog posts are managed from the Admin panel.
