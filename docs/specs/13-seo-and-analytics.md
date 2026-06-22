# 13 — SEO & Analytics

> **Language note:** All meta tags, structured data content, and SEO text will be in **Hebrew**, targeting Israeli Hebrew-language search queries.

---

## 16. SEO

> The site's discoverability depends heavily on search engines finding and indexing Hebrew product content correctly (e.g. "טלית מרינוס", "תפילין מהודרות"). Basic SEO implemented correctly from the start prevents costly remediation later.

### 16.1 Meta Tags (per page)

Every page must render its own `<title>` and `<meta name="description">` tag. For product and category pages, these are dynamic.

```jsx
// Example for ProductPage — using react-helmet or equivalent
<Helmet>
  <title>{product.seo?.metaTitle || `${product.name} | [Store Name]`}</title>
  <meta name="description" content={product.seo?.metaDescription || product.description?.slice(0, 160)} />

  {/* Open Graph — for WhatsApp / Facebook link previews */}
  <meta property="og:title" content={product.seo?.metaTitle || product.name} />
  <meta property="og:description" content={product.seo?.metaDescription} />
  <meta property="og:image" content={product.images?.[0]} />
  <meta property="og:type" content="product" />
</Helmet>
```

### 16.2 Structured Data (JSON-LD)

**On every Product page** — `Product` schema:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "[product name in Hebrew]",
  "image": "[image URL]",
  "description": "[product description]",
  "offers": {
    "@type": "Offer",
    "price": "[base price]",
    "priceCurrency": "ILS",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "[ratingAverage]",
    "reviewCount": "[ratingCount]"
  }
}
```

**On the Home page** — `Organization` schema:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "[Store Name]",
  "url": "[site URL]",
  "telephone": "[phone number]",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "[city]",
    "addressCountry": "IL"
  }
}
```

**On every Category/Product page** — `BreadcrumbList` schema:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "דף הבית", "item": "/" },
    { "@type": "ListItem", "position": 2, "name": "[Category]", "item": "/c/[slug]" },
    { "@type": "ListItem", "position": 3, "name": "[Product]", "item": "/product/[slug]" }
  ]
}
```

### 16.3 Sitemap

- `public/sitemap.xml` is auto-generated at build time
- Must include all active product pages, category pages, blog posts, and static pages
- Exclude admin routes, account routes, cart/checkout routes

### 16.4 Robots.txt

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /account/
Disallow: /cart
Disallow: /checkout

Sitemap: https://[domain]/sitemap.xml
```

### 16.5 URL Structure

- All content URLs use slugs based on the product/category name, not IDs
- Product: `/product/[hebrew-transliterated-slug]`
- Category: `/c/[slug]`
- Blog: `/blog/[slug]`
- Clean, stable URLs — never change a published URL without a 301 redirect

### 16.6 Image SEO

- All `<img>` tags must have descriptive `alt` text in Hebrew (product name + key spec)
- Use WebP format for all product images (convert on upload in S3/Cloudinary)
- Implement lazy loading for below-the-fold images: `<img loading="lazy" />`
- No raw image filenames like `DSC_0042.jpg` — rename on upload to the product slug

### 16.7 Canonical URLs

- Every page must render a `<link rel="canonical" href="[canonical URL]" />` tag
- Prevents duplicate content penalties if a product appears in multiple category filters

---

## 17. Analytics

### 17.1 Google Analytics 4 (GA4)

- Load GA4 script only **after** the user has accepted cookies via `CookieConsentBanner`
- Track standard e-commerce events using GA4's recommended event names:

| User action | GA4 event |
|-------------|-----------|
| View product page | `view_item` |
| Add to cart | `add_to_cart` |
| Begin checkout | `begin_checkout` |
| Payment confirmed | `purchase` (fires in OrderConfirmationPage) |
| Search | `search` |

### 17.2 Meta Pixel (Facebook / Instagram)

- Load Meta Pixel script only **after** cookie consent
- Standard pixel events to fire:

| User action | Pixel event |
|-------------|------------|
| View product | `ViewContent` |
| Add to cart | `AddToCart` |
| Begin checkout | `InitiateCheckout` |
| Purchase confirmed | `Purchase` |

### 17.3 Implementation Rule

Both GA4 and Meta Pixel scripts must be **conditionally loaded** based on `CookieConsentBanner` state. They must NOT be loaded on page load before consent. Use a consent state from localStorage / cookie consent context to gate the script injection.

```jsx
// Pseudocode — conditional analytics loading
useEffect(() => {
  if (cookieConsent === 'accepted') {
    loadGoogleAnalytics(GA_MEASUREMENT_ID);
    loadMetaPixel(PIXEL_ID);
  }
}, [cookieConsent]);
```
