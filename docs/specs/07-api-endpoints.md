# 07 — Backend API Endpoints

> **Language note:** The website UI will be in **Hebrew**. API responses return data in the language stored in the DB (Hebrew product names, descriptions, etc.), but the API contract itself is defined in English here.

> All endpoints are prefixed with `/api`. Admin endpoints additionally require the `adminOnly` middleware (JWT with `role: 'admin'`).

---

## Products

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | List products with pagination and filtering |
| GET | `/api/products/featured` | Featured products (for homepage FeaturedProducts section) |
| GET | `/api/products/new` | NEW — newest products sorted by `createdAt` (for NewArrivalsStrip) |
| GET | `/api/products/:slug` | Single product by slug (includes full variants array) |

### Query Parameters for `GET /api/products`

| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Category slug |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 24) |
| `minPrice` | number | Minimum price filter |
| `maxPrice` | number | Maximum price filter |
| `sort` | string | `price_asc`, `price_desc`, `newest` |
| `tag` | string | NEW — filter by tag (e.g. `featured`, `sale`) |

---

## Categories

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/categories` | All categories as a tree (nested parent/child structure) |
| GET | `/api/categories/:slug` | Single category + its direct sub-categories |

---

## Search (NEW)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/search?q=...` | Search products with Hebrew normalisation; minimum 2 characters |

**Implementation note:** The server normalises the query string via `normalizeHebrew()` before running the MongoDB text index query. Also queries the `searchTokens` array field on each Product document (see §9).

---

## Reviews (NEW)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products/:id/reviews` | Approved reviews for a specific product |
| GET | `/api/reviews/summary` | Store-wide average rating + count (for ReviewsWidget on homepage) |
| POST | `/api/products/:id/reviews` | Submit a review — **protected**: user must be logged in AND must have a completed order containing this product |

### Review submission guard logic (server-side)
1. Verify JWT → get `userId`
2. Query `Order` collection for any Order with `status: 'paid' | 'shipped' | 'delivered'` that belongs to `userId` and contains `productId` in `items`
3. If no such order exists → return `403 Forbidden` with message "Only verified purchasers may review this product"
4. If review already submitted for this product by this user → return `409 Conflict`

---

## Coupons (NEW)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/coupons/validate` | Validate coupon code; returns discount type, value, and whether it's applicable to the current cart total |

**Request body:**
```json
{ "code": "SAVE20", "cartTotal": 350 }
```

**Response:**
```json
{
  "valid": true,
  "type": "percentage",
  "value": 20,
  "discount": 70,
  "message": "20% discount applied"
}
```

---

## Gift Cards (NEW)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/gift-cards` | Purchase a gift card (creates unique code, triggers email to recipient) |
| GET | `/api/gift-cards/:code` | Check remaining balance on a gift card code |

---

## Branches (NEW)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/branches` | All branches, grouped by city |

---

## Blog (NEW)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/blog` | List of published blog posts (pagination supported) |
| GET | `/api/blog/:slug` | Single blog post by slug |

---

## Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create new customer account |
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/auth/me` | Get current user profile — **protected** |
| POST | `/api/auth/admin-login` | NEW — separate admin login, returns JWT with `role: 'admin'` |

---

## Orders

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/orders` | Create order (initial `status: 'pending'`) |
| GET | `/api/orders/my` | All orders for the logged-in customer — **protected** |
| GET | `/api/orders/:id` | Single order detail — **protected** (customer sees own orders only) |

---

## Payments (NEW)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/payments/create-session` | Create a payment session with the chosen provider; returns URL/token for the iframe |
| POST | `/api/payments/webhook` | **Webhook** — called by the payment provider when payment is confirmed; updates order status to `paid`; triggers invoice creation and confirmation email |

### Critical webhook security note
- The webhook endpoint must validate the request signature / HMAC provided by the payment provider before processing.
- **Never** update order status to `paid` based on a frontend callback — only via the verified webhook.

---

## Invoices (NEW)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/orders/:id/invoice` | Returns a download link to the invoice PDF (generated by the invoicing service after payment confirmed) |

---

## Admin Routes (NEW — all behind `adminOnly` middleware)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/dashboard` | Summary statistics (sales, orders, low stock) |
| GET | `/api/admin/products` | Product list with admin-level data (stock qty etc.) |
| POST | `/api/admin/products` | Create new product |
| PUT | `/api/admin/products/:id` | Update product |
| DELETE | `/api/admin/products/:id` | Delete product |
| GET | `/api/admin/orders` | All orders, filterable by status |
| PUT | `/api/admin/orders/:id/status` | Update order status + tracking number |
| POST | `/api/admin/coupons` | Create coupon |
| PUT | `/api/admin/coupons/:id` | Update coupon |
| DELETE | `/api/admin/coupons/:id` | Delete coupon |
| GET | `/api/admin/reviews` | List reviews pending approval |
| PUT | `/api/admin/reviews/:id/approve` | Approve a review |
| PUT | `/api/admin/reviews/:id/reject` | Reject a review |
| GET | `/api/admin/customers` | Customer list |
