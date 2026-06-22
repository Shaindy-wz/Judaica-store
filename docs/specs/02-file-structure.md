# 02 — Project Architecture & File Structure

> **Language note:** The website UI and all content will be in **Hebrew** (RTL). This file documents the technical structure in English.

> **Key architectural rule:** Do NOT create separate routing namespaces per feature area (admin/, reviews/, search/, zmanim/). New routes are added to the existing router. The Footer shows legal links at the bottom only — no full multi-column link structure.

---

## Complete File Tree

```
/
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── robots.txt                 ← SEO
│   │   ├── sitemap.xml                ← SEO (generated automatically at build time)
│   │   └── assets/
│   │       ├── images/
│   │       └── icons/
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Header.jsx
│       │   │   ├── TopBar.jsx
│       │   │   ├── Navbar.jsx
│       │   │   ├── Footer.jsx
│       │   │   ├── Layout.jsx
│       │   │   ├── CookieConsentBanner.jsx    ← NEW
│       │   │   └── AccessibilityWidget.jsx    ← NEW (floating button — see §13)
│       │   ├── ui/
│       │   │   ├── Button.jsx
│       │   │   ├── Badge.jsx
│       │   │   ├── StarRating.jsx
│       │   │   ├── Breadcrumb.jsx
│       │   │   ├── SearchBar.jsx
│       │   │   ├── SearchOverlay.jsx          ← NEW (full search + Hebrew normalisation)
│       │   │   └── WhatsAppButton.jsx
│       │   ├── home/
│       │   │   ├── HeroBanner.jsx
│       │   │   ├── QuickCategoryStrip.jsx     ← NEW (strip just below Hero)
│       │   │   ├── CategoryGrid.jsx
│       │   │   ├── NewArrivalsStrip.jsx       ← NEW ("New Arrivals" + "See All")
│       │   │   ├── FeaturedProducts.jsx
│       │   │   ├── ReviewsWidget.jsx
│       │   │   ├── ShabbatTimesWidget.jsx     ← NEW (Friday/Shabbat times)
│       │   │   └── PromoStrip.jsx
│       │   ├── product/
│       │   │   ├── ProductCard.jsx
│       │   │   ├── ProductGrid.jsx
│       │   │   ├── ProductGallery.jsx
│       │   │   ├── ProductDetails.jsx
│       │   │   ├── ProductOptions.jsx
│       │   │   ├── ProductPriceRange.jsx      ← NEW ("₪239 – ₪449")
│       │   │   ├── ReturnPolicyNotice.jsx     ← NEW (notice based on product category)
│       │   │   └── AddToCartButton.jsx
│       │   ├── reviews/                       ← NEW module
│       │   │   ├── ReviewList.jsx
│       │   │   ├── ReviewForm.jsx
│       │   │   └── ReviewSummary.jsx          ← shows average + count breakdown
│       │   ├── cart/
│       │   │   ├── CartDrawer.jsx
│       │   │   ├── CartItem.jsx
│       │   │   ├── CouponInput.jsx            ← NEW
│       │   │   └── CartSummary.jsx
│       │   ├── checkout/                      ← NEW module
│       │   │   ├── ShippingForm.jsx
│       │   │   ├── PaymentFrame.jsx           ← iframe of payment provider
│       │   │   ├── CancellationRightsNotice.jsx ← NEW (14-day consumer rights)
│       │   │   └── OrderSummary.jsx
│       │   ├── branches/                      ← NEW module
│       │   │   ├── BranchList.jsx
│       │   │   ├── BranchCard.jsx
│       │   │   └── BranchMap.jsx
│       │   ├── blog/                          ← NEW module
│       │   │   ├── BlogList.jsx
│       │   │   └── BlogPostCard.jsx
│       │   └── account/
│       │       ├── LoginForm.jsx
│       │       ├── RegisterForm.jsx
│       │       └── AccountDashboard.jsx
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── CategoryPage.jsx
│       │   ├── ProductPage.jsx
│       │   ├── CartPage.jsx
│       │   ├── CheckoutPage.jsx
│       │   ├── OrderConfirmationPage.jsx      ← NEW
│       │   ├── AccountPage.jsx
│       │   ├── OrdersPage.jsx
│       │   ├── AboutPage.jsx
│       │   ├── BranchesPage.jsx               ← NEW
│       │   ├── BlogPage.jsx / BlogPostPage.jsx ← NEW
│       │   ├── FaqPage.jsx                    ← NEW
│       │   ├── ShabbatTimesPage.jsx           ← NEW
│       │   ├── GiftCardPage.jsx               ← NEW
│       │   ├── TermsPage.jsx                  ← NEW (Terms of Service)
│       │   ├── PrivacyPolicyPage.jsx          ← NEW
│       │   ├── AccessibilityStatementPage.jsx ← NEW (accessibility declaration)
│       │   ├── ShippingReturnsPage.jsx        ← NEW
│       │   └── NotFoundPage.jsx               ← NEW (404)
│       ├── admin/                             ← Completely separate section, see §12
│       │   ├── pages/
│       │   │   ├── AdminLoginPage.jsx
│       │   │   ├── AdminDashboardPage.jsx
│       │   │   ├── AdminProductsPage.jsx
│       │   │   ├── AdminProductFormPage.jsx
│       │   │   ├── AdminOrdersPage.jsx
│       │   │   ├── AdminOrderDetailPage.jsx
│       │   │   ├── AdminCategoriesPage.jsx
│       │   │   ├── AdminCouponsPage.jsx
│       │   │   ├── AdminReviewsPage.jsx
│       │   │   └── AdminCustomersPage.jsx
│       │   └── components/
│       │       ├── AdminSidebar.jsx
│       │       ├── AdminTable.jsx
│       │       ├── ImageUploader.jsx
│       │       └── ProtectedAdminRoute.jsx
│       ├── context/
│       │   ├── CartContext.jsx
│       │   ├── AuthContext.jsx
│       │   └── SearchContext.jsx              ← NEW
│       ├── hooks/
│       │   ├── useCart.js
│       │   ├── useAuth.js
│       │   ├── useProducts.js
│       │   ├── useReviews.js                  ← NEW
│       │   └── useShabbatTimes.js             ← NEW
│       ├── services/
│       │   ├── api.js
│       │   ├── productService.js
│       │   ├── authService.js
│       │   ├── orderService.js
│       │   ├── reviewService.js               ← NEW
│       │   ├── searchService.js               ← NEW
│       │   ├── couponService.js               ← NEW
│       │   └── zmanimService.js               ← NEW (calls Hebcal API)
│       ├── styles/
│       │   ├── globals.css
│       │   ├── variables.css
│       │   └── rtl.css
│       ├── utils/
│       │   ├── formatPrice.js
│       │   ├── validators.js
│       │   └── hebrewSearchNormalize.js       ← NEW (niqqud/dagesh normalisation)
│       ├── App.jsx
│       └── main.jsx
└── backend/
    └── src/
        ├── routes/
        │   ├── products.js
        │   ├── categories.js
        │   ├── orders.js
        │   ├── users.js
        │   ├── auth.js
        │   ├── reviews.js                     ← NEW
        │   ├── search.js                      ← NEW
        │   ├── coupons.js                     ← NEW
        │   ├── giftCards.js                   ← NEW
        │   ├── branches.js                    ← NEW
        │   ├── blog.js                        ← NEW
        │   ├── payments.js                    ← NEW (webhook from payment provider)
        │   ├── invoices.js                    ← NEW (integration with invoicing service)
        │   └── admin/                         ← Admin-only routes, all behind adminOnly middleware
        │       ├── adminProducts.js
        │       ├── adminOrders.js
        │       └── adminDashboard.js
        ├── controllers/                       ← (optional: extracted from route files)
        ├── models/
        │   ├── Product.js
        │   ├── Category.js
        │   ├── Order.js
        │   ├── User.js
        │   ├── Review.js                      ← NEW
        │   ├── Coupon.js                      ← NEW
        │   ├── GiftCard.js                    ← NEW
        │   ├── Branch.js                      ← NEW
        │   └── BlogPost.js                    ← NEW
        ├── middleware/
        │   ├── auth.js
        │   ├── adminOnly.js                   ← NEW
        │   └── errorHandler.js
        └── app.js
```

---

## Notes

- The `/admin` section is a completely separate React sub-tree with its own login page, its own layout, and protected by `ProtectedAdminRoute.jsx`. It does not share layout with the customer-facing site.
- All backend routes under `/api/admin/*` are protected server-side by the `adminOnly` middleware — never rely solely on frontend guards.
- The `services/` folder abstracts all API calls; components never call `fetch` / `axios` directly.
- The `utils/hebrewSearchNormalize.js` is used both client-side (for instant filtering) and server-side (to build `searchTokens` field on Product documents).
