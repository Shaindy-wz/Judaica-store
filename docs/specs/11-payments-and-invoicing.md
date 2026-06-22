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

**Implemented.** Sent via generic SMTP (`services/emailService.js`, using `nodemailer`) rather than a specific provider's SDK — this works unchanged with Resend, SendGrid, Brevo, or any other provider's SMTP relay, so the provider choice is just an `.env` credential swap, not a code change. If `SMTP_HOST` isn't set the service logs a warning and skips sending instead of throwing, so local/dev environments work without real credentials.

| Trigger | Email sent | Status |
|---------|-----------|--------|
| Order created (pending payment) | No email yet | — |
| Order marked `paid` | **Order Confirmation** — order number, items, total, invoice PDF link | Implemented — `handleOrderPaid()` in `services/orderFulfillment.js` |
| Admin marks order as Shipped | **Shipping Notification** — tracking number | Implemented — `handleOrderShipped()` in `services/orderFulfillment.js` |
| User registers | Welcome email + confirmation (optional) | Not built |
| Password reset requested | Reset link (time-limited, 1 hour) | Not built |
| Gift card purchased | Gift card code sent to recipient email + personal message | Not built |

There is no payment webhook yet (§14.1/§14.2 provider not chosen), so today the `paid`/`shipped` triggers fire from the admin order-status endpoint (`PUT /api/admin/orders/:id/status`, see `07-api-endpoints.md`). `handleOrderPaid`/`handleOrderShipped` are written as standalone functions specifically so that once a payment webhook is built, it can call `handleOrderPaid(order)` directly instead of duplicating this logic.

### Email Template Requirements
- RTL layout (`direction: rtl; text-align: right`) — implemented inline in `emailLayout()` since email clients don't load external stylesheets or resolve CSS custom properties (`var(--token)`); colours are hardcoded to match the design tokens instead.
- Hebrew font stack (system fonts as fallback)
- All templates must include the store name, legal business name, and unsubscribe link (for marketing emails only) — legal business name and unsubscribe link still TODO once those are decided (see Open Questions §20).

---

## 14.4 Invoice / Receipt Issuance — Invoicing Service Integration

**Service chosen: Green Invoice.** Implemented in `services/greenInvoiceService.js`.

### Flow (as implemented)

```
Admin marks order 'paid' (PUT /api/admin/orders/:id/status)
  → handleOrderPaid() in services/orderFulfillment.js
  → createInvoiceForOrder() authenticates against Green Invoice (POST /account/token,
    cached ~23h) and creates a document (POST /documents) with:
      - Customer name + address (from Order.shipping, falls back to Order.user)
      - Line items: product names, quantities, prices (+ shipping/discount lines)
      - Document type 400 (חשבונית מס קבלה — tax invoice + receipt), configurable via
        GREEN_INVOICE_DOC_TYPE
  → Green Invoice returns: document number + PDF url
  → Backend stores: Order.invoiceNumber, Order.invoiceUrl
  → Invoice PDF URL included in order confirmation email
  → Invoice PDF accessible via GET /api/orders/:id/invoice
```

If `GREEN_INVOICE_API_KEY`/`SECRET` aren't set, invoice creation is skipped (logged warning) rather than blocking the order status update or confirmation email — this keeps `paid`/`shipped` transitions usable in dev without live credentials.

Once a real payment webhook is built (§14.1/§14.2, provider still undecided), it should call `handleOrderPaid(order)` directly instead of going through the admin endpoint.

### Remaining Open Questions for Invoicing
- Is the business registered for VAT (עוסק מורשה) or exempt (עוסק פטור)? Controls `GREEN_INVOICE_VAT_TYPE` (`0` = included/calculated, `2` = exempt) — currently defaults to `0`.
- Legal business name + VAT number for the Green Invoice account/business profile (used by Green Invoice itself when rendering the PDF, not passed per-request).
- Field mappings (`type`, `income[].vatType`, `payment[].type` codes) were implemented from Green Invoice's documented v1 API; sanity-check them against the live dashboard once a real sandbox/production API key is available, before relying on this for real customer invoices.

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
