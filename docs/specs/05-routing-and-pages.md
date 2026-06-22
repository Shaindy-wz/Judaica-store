# 05 — Routing & Pages

> **Language note:** All page content, headings, and UI copy will be in **Hebrew** (RTL). Routes use English slugs for SEO and URL cleanliness.

---

## 6.1 Home Page (`/`)

```
<TopBar />
<Header />
  <HeroBanner />            ← Full-width background image with headline + CTA buttons
    <QuickCategoryStrip />  ← NEW: horizontal strip of category quick-links just below Hero
  <PromoStrip />            ← Promo bar: "Free shipping over ₪X | Fast delivery | Quality guarantee"
  <CategoryGrid />          ← Main category cards
  <NewArrivalsStrip />      ← NEW: "New Arrivals" + "See All" link
  <FeaturedProducts />      ← Featured products (carousel or grid)
  <ReviewsStrip />          ← Snapshot of top reviews
<Footer />
<WhatsAppButton />          ← Fixed bottom-right
<AccessibilityWidget />     ← NEW: Fixed floating button
<ReviewsWidget />           ← Fixed bottom-left (store-wide rating widget)
<CookieConsentBanner />     ← NEW: appears on first visit only
```

---

## 6.2 Category Page (`/category/:slug`)

```
<Header />
<CategoryBanner />         ← navy banner with category name centred
<Breadcrumb />
<div className="category-layout">
  <aside>
    <SubCategoryList />    ← Sub-category filter links
    <PriceFilter />        ← Min/max price range filter
  </aside>
  <main>
    <ProductGrid />        ← 3–4 columns of ProductCard
    <Pagination />
  </main>
</div>
<Footer />
```

---

## 6.3 Product Page (`/product/:slug`)

```
<Header />
<Breadcrumb />
<div className="product-layout">
  <ProductGallery />       ← Thumbnail strip + main image
  <ProductDetails>
    <h1>{name}</h1>
    <ReviewSummary />      ← NEW: average rating + review count (links down to #reviews section)
    <ProductPriceRange />  ← NEW: displays price range depending on variants
    <ProductOptions />     ← Colour / Finish / Size selectors (variant system, see §5.10)
    <AddToCartButton />
    <CancellationRightsNotice /> ← NEW: short notice ("You may cancel within 14 business days…"
                                    OR "This is a customised/holy item — cannot be returned"
                                    based on product category)
    <Description />
    <Specs />              ← Technical specifications (material, kashrut, hashgacha, tradition, craftsmanship)
  </ProductDetails>
</div>
<section id="reviews">
  <ReviewList />           ← NEW: approved reviews
  <ReviewForm />           ← NEW: shown only to verified purchasers who are logged in
</section>
<RelatedProducts />        ← Related products carousel
<Footer />
```

> **Spec note on `<Specs>`:** The Specs section must not show only "Material" as a generic field. It must render structured per-product attributes: maker's name (for holy items), Ashkenazi/Sephardic tradition, certification authority (hashgacha), craftsmanship level (hand-made / machine-made), etc. These are stored as structured model fields — see §9 (Product model `specs` object). Never store these as freeform text.

---

## 6.4 Cart & Checkout Pages (`/cart`, `/checkout`)

```
<Header />
<CartPage>
  <CartItem ... />          ← Each cart item with quantity controls
  <CouponInput />           ← NEW: coupon code field
  <CartSummary />           ← Subtotal, discount line, total
</CartPage>

<CheckoutPage>
  <ShippingForm />          ← Name, phone, address, city, zip
  <CancellationRightsNotice /> ← NEW: full notice before placing order
                                  (varies by cart contents)
  <PaymentFrame />          ← NEW: payment provider iframe (we do NOT collect card data ourselves!)
  <OrderSummary />          ← Final order preview
</CheckoutPage>
<Footer />
```

After successful payment → redirect to `OrderConfirmationPage` (NEW) showing order number, summary, and a link to track the shipment (sent by the email service once shipped — see §11).

---

## 6.5 Branches Page (`/branches`) — NEW

```
<Header />
<h1>Our Branches</h1>
<p>Short introductory text ("Come visit us in person and discover our full range…")</p>
<BranchMap />              ← Interactive map with all branch pins
<BranchList>               ← Grouped by city
  <BranchCard ... />       ← Address, phone, hours, Google Maps, Waze, accessibility badge
</BranchList>
<Footer />
```

> **Important:** If the business has **no** physical branches, remove the Branches page and the "Branches" link from the TopBar/Footer entirely. See Open Questions §20.

---

## 6.6 Blog & FAQ Pages (`/blog`, `/blog/:slug`, `/faq`) — NEW

```
<Header />
<BlogList />              ← Post list: title, cover, excerpt, date — rich in SEO content
<Footer />
```

```
<Header />
<FaqPage>                 ← Accordion-style FAQ sections: Shipping, Returns, Products, Services
</FaqPage>
<Footer />
```

---

## 6.7 Shabbat Times Page (`/shabbat-times`) — NEW

See component spec §5.12. Full page version of the ShabbatTimesWidget with:
- City selector (defaulting to Jerusalem / Tel Aviv)
- Candle-lighting time, Havdalah time, next Shabbat date
- Upcoming Jewish holidays section (optional)

---

## 6.8 Legal & Compliance Pages (NEW — mandatory)

| Route | Content |
|-------|---------|
| `/terms` | Full Terms of Service (must include consumer cancellation rights, pricing policy) |
| `/privacy-policy` | Privacy Policy (data collected, usage, third parties) |
| `/accessibility-statement` | Accessibility Statement (WCAG 2.1 AA / Israeli Standard 5568, see §10) |
| `/shipping-returns` | Shipping & Returns Policy (referenced from "Cancellation Rights Notice" throughout the site) |

All of these pages contain static legal text (Markdown / CMS managed), but the **content must be legally vetted by a lawyer or legal advisor**, not drafted by the AI. See §10.

---

## 6.9 404 Page (`*`) — NEW

```
<Header />
<div className="not-found">
  <h1>הדף לא נמצא</h1>
  <p>ייתכן שהקישור ששלחת לא עודכן או שהדף עבר למקום אחר</p>
  <Button href="/">חזרה לדף הבית</Button>
  <SearchBar />
</div>
<Footer />
```

---

## 6.10 Account Page (`/account`)

**Tab structure:**
- Login / Register (if not logged in)
- Logged-in dashboard tabs:
  - Personal Details
  - My Orders
  - Saved Addresses
  - Communication Preferences (NEW — opt-in/out of marketing)
  - **Wishlist** (NEW — based on user table `wishlist` field; shown only if feature is enabled in admin)

```jsx
// AccountPage.jsx
export default function AccountPage() {
  const { user } = useAuth();
  if (!user) return <LoginRegisterTabs />;

  return (
    <div className="account">
      <AccountSidebar />  {/* Nav links */}
      <AccountContent>
        <Routes>
          <Route path="orders" element={<OrdersPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="preferences" element={<MarketingPreferencesPage />} />  {/* NEW */}
        </Routes>
      </AccountContent>
    </div>
  );
}
```

---

## 6.11 Admin Panel (`/admin/*`) — NEW, separate section

See full Admin spec §12. Routes summary:

```
/admin/login                  ← Separate login page (not /account)
/admin                        ← Dashboard: sales stats, recent orders, low-stock products
/admin/products               ← Product list + search/filter
/admin/products/new           ← Create product form (with variants, images, SEO)
/admin/products/:id/edit      ← Edit existing product
/admin/categories             ← Manage category tree
/admin/orders                 ← Order list + filter by status
/admin/orders/:id             ← Order detail + status update + tracking number
/admin/coupons                ← Coupon CRUD
/admin/reviews                ← Approve/reject pending reviews
/admin/customers              ← Customer list
```
