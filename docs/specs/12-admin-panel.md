# 12 — Admin Panel

> **Language note:** The Admin Panel UI will also be in **Hebrew**. It is a separate React sub-application under `/admin/*` with its own layout, auth, and route guards.

> **This module is intentionally scoped to what's needed at launch.** Do not add inventory management, supplier purchase orders, analytics dashboards with graphs, or multi-admin role levels until explicitly requested.

---

## 15.1 Admin Authentication

- Admin login is at `/admin/login` — a **completely separate** login page from the customer `/account` login
- The `User.role` field distinguishes `'customer'` from `'admin'`
- Endpoint: `POST /api/auth/admin-login` → returns JWT with `role: 'admin'` in payload
- The `adminOnly` middleware on the backend verifies JWT and checks `role === 'admin'` before any `/api/admin/*` route handler runs
- Frontend `ProtectedAdminRoute.jsx` redirects to `/admin/login` if the stored token does not contain `role: 'admin'`
- **Recommended (not mandatory at launch):** 2FA (TOTP via Google Authenticator) for the admin login

---

## 15.2 Admin Dashboard (`/admin`)

Displays summary statistics and quick-action links:

- Today's / this week's / this month's revenue (simple bar or number display)
- Number of new orders in the last 24 hours
- List of most recently placed orders (last 10) with quick status view
- Products with low stock (requires `stockQuantity` to be tracked — see deferred features note in §1)
- Pending reviews awaiting approval (count + link)

---

## 15.3 Product Management (`/admin/products`, `/admin/products/new`, `/admin/products/:id/edit`)

### Product List View
- Sortable table with: product image, name, category, base price, in-stock status
- Search/filter by name, category, tag
- Bulk actions: mark as featured, mark out of stock, delete

### Product Create/Edit Form (`AdminProductFormPage.jsx`)
The form must support all fields in the Product model (§9):

| Field | Input Type |
|-------|-----------|
| Name (Hebrew) | Text input |
| Slug | Auto-generated from name, editable |
| Description (Hebrew) | Rich text editor (Quill or TipTap) |
| Category | Dropdown (hierarchical) |
| Tags | Multi-select tag input |
| **Options (variant dimensions)** | Dynamic list: add dimension name + values (e.g. "צבע: לבן, שחור-לבן") |
| **Variants (each combination)** | Auto-generated matrix from options; editable price + SKU + stock per variant |
| Base price | Number |
| Original price (sale) | Number (optional) |
| Badge | Select: None / חדש / מבצע / פופולרי |
| Images | `ImageUploader.jsx` — multi-image upload to S3/Cloudinary |
| Specs: material, kashrut, hashgacha, tradition, craftsmanship | Text inputs |
| Return policy: returnable, customizable, nonReturnableReason | Toggle + text |
| SEO: metaTitle, metaDescription | Text inputs with character count |
| In stock toggle | Toggle |
| Featured toggle | Toggle |

### ImageUploader Component (`admin/components/ImageUploader.jsx`)
- Drag-and-drop file upload
- Uploads directly to S3 / Cloudinary via pre-signed URL (server issues the URL, never handles the file binary itself)
- Shows upload progress and thumbnails
- Supports reordering images (first image = main product image)

---

## 15.4 Order Management (`/admin/orders`, `/admin/orders/:id`)

### Order List View
- Table: order number, date, customer name, total, status badge, action links
- Filter by status: `pending | paid | shipped | delivered | cancelled`
- Search by order number or customer name/email

### Order Detail View (`AdminOrderDetailPage.jsx`)
- Full order summary: items, quantities, prices, subtotal, discount, shipping cost, total
- Customer shipping address
- Change status dropdown (with confirmation dialog for `cancelled`)
- **Tracking number input field** — when admin enters a tracking number and sets status to `shipped`, the system automatically sends a shipping notification email to the customer (see §11 emails)
- Invoice PDF link (if generated)
- Payment transaction ID

---

## 15.5 Category Management (`/admin/categories`)

- Tree view of all categories (parent → children → grandchildren)
- Drag-and-drop reordering within a level
- Add / Edit / Delete category (with image upload and slug)
- Warning when deleting a category that has products assigned to it

---

## 15.6 Coupon Management (`/admin/coupons`)

- Table of all coupons: code, type, value, expiry, usage count vs limit, active toggle
- Create coupon form: code, type (percentage/fixed), value, min order amount, expiry date, usage limit
- Edit and delete existing coupons

---

## 15.7 Review Moderation (`/admin/reviews`)

- Table of reviews with `status: 'pending'`
- Each row shows: product name, reviewer name, rating, comment, date
- Actions: **Approve** (sets `status: 'approved'`, updates `Product.ratingAverage` and `Product.ratingCount`) or **Reject** (sets `status: 'rejected'`)
- Separate tab for already-approved reviews (can be un-approved if needed)

---

## 15.8 Customer Management (`/admin/customers`)

- Customer list: name, email, registration date, number of orders, total spend
- Click through to see a customer's order history
- Search by name or email
- **No password management** — admin cannot see or reset customer passwords (passwords are hashed; only "forgot password" email flow exists)
