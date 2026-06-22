# 11 — Payments, Invoicing & Order Emails

> **Language note:** All customer-facing emails and payment pages will be in **Hebrew** (RTL). This spec documents the technical flow in English.

---

## 14.1 Payment Provider Options (Decision Required)

One Israeli payment gateway must be chosen before implementing the checkout flow. The integration architecture is provider-agnostic at the component level (`PaymentFrame`), but the specific API calls differ per provider.

| Provider | Strengths | Notes |
|---------|-----------|-------|
| **Cardcom** | Most popular in Israel, excellent documentation, broad bank support | Relatively easy API, good React iframe support |
| **PayPlus** | Modern platform, Israeli-focused, React-native support | Competitive pricing |
| **Tranzila** | Established, widely used in Israel | Older API, less modern but very stable |
| **Meshulam** | Simple setup for small businesses, supports instalment payments (credit terms) | Good for businesses with local customer base already using credit instalment |

> **Decision needed:** Choose ONE provider. The exact `PaymentFrame` implementation and `POST /api/payments/create-session` payload format will depend on this choice. See Open Questions §20.

---

## 14.2 Payment Architecture

```
[CheckoutPage]
  │
  ├─ POST /api/payments/create-session
  │   → Backend sends order details to payment provider API
  │   → Provider returns a URL or token for the iframe
  │
  ↓
[PaymentFrame component]
  │   Renders the provider's iframe (card data never touches our servers)
  │
  ↓
[Payment Provider]
  │   Processes the card transaction
  │   → Sends Webhook: POST /api/payments/webhook
  │
  ↓
[Backend webhook handler]
  │   1. Verify request signature / HMAC (provider-specific)
  │   2. Update Order.status to 'paid'
  │   3. Trigger invoice creation (§14.4)
  │   4. Send order confirmation email (§14.3)
  │
  ↓
[Frontend]
    Redirects to /order-confirmation/:id
```

### Critical Rule
**Never update order status to `paid` based on a frontend redirect or callback.** Only the server-side webhook (with signature verification) may set `status: 'paid'`. This prevents fraudulent order confirmations.

---

## 14.3 Transactional Emails

Uses one of: **Resend / SendGrid / Brevo** (decision to confirm). All email templates must be HTML with RTL support (`dir="rtl"`, Hebrew fonts where possible).

| Trigger | Email sent |
|---------|-----------|
| Order created (pending payment) | No email yet |
| Payment confirmed (webhook fires) | **Order Confirmation** — order number, items, total, invoice PDF link |
| Admin marks order as Shipped | **Shipping Notification** — tracking number + carrier link |
| Admin updates shipping status | Optional status update |
| User registers | Welcome email + confirmation (optional) |
| Password reset requested | Reset link (time-limited, 1 hour) |
| Gift card purchased | Gift card code sent to recipient email + personal message |

### Email Template Requirements
- RTL layout (`direction: rtl; text-align: right`)
- Hebrew font stack (system fonts as fallback)
- All templates must include the store name, legal business name, and unsubscribe link (for marketing emails only)

---

## 14.4 Invoice / Receipt Issuance — Invoicing Service Integration

**Services:** Green Invoice / EZcount / iCount (all are Israeli-licensed SaaS invoicing platforms with REST APIs).

### Flow

```
Webhook confirms payment
  → Backend calls invoicing service API
  → Creates a tax receipt or invoice with:
      - Business name + VAT number
      - Customer name + address
      - Line items: product names, quantities, prices
      - Total, VAT breakdown (17% Israeli VAT if applicable)
  → Invoicing service returns: invoice number + PDF URL
  → Backend stores: Order.invoiceNumber, Order.invoiceUrl
  → Invoice PDF URL included in order confirmation email
  → Invoice PDF accessible via GET /api/orders/:id/invoice
```

### Open Questions for Invoicing
- Is the business registered for VAT (עוסק מורשה) or exempt (עוסק פטור)?
- Which invoicing service does the business currently use?
- Should we generate a "receipt" (קבלה) or a "tax invoice" (חשבונית מס)?

> **See Open Questions §20 for the full checklist.**

---

## 14.5 Coupon System

**Model:** See `Coupon` in §9.

### Validation Flow
1. User enters coupon code in `CouponInput` on the Cart page
2. Frontend calls `POST /api/coupons/validate` with `{ code, cartTotal }`
3. Server checks:
   - Code exists and `active: true`
   - Not expired (`expiresAt > now`)
   - Usage limit not exceeded (`usedCount < usageLimit` if set)
   - `cartTotal >= minOrderAmount` if set
4. Returns discount amount or error message
5. On successful order placement, server increments `Coupon.usedCount`

### Coupon Types
- `percentage` — percentage off the subtotal (e.g. 20% off)
- `fixed` — fixed amount off (e.g. ₪50 off)
