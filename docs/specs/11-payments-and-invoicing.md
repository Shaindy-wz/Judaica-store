# 11 — Payments, Invoicing & Order Emails

> **Language note:** All customer-facing emails and payment pages will be in **Hebrew** (RTL). This spec documents the technical flow in English.

---

## 14.1 Payment Provider — Nedarim Plus (decided)

**Provider chosen: Nedarim Plus** (נדרים פלוס, matara.pro), PCI-DSS certified. Integration method: **iframe with a server-created transaction** (Nedarim's "אייפרם: הקמת עסקה בצד שרת"). It's the flow Nedarim recommends for sites, and the most secure one, because the amount is fixed server-side before the customer sees the card form.

Implemented in `backend/src/services/nedarimService.js`, `controllers/paymentController.js`, `routes/payments.js` and `frontend/src/components/checkout/PaymentFrame.jsx`.

### Environment variables
| Variable | Required | Purpose |
|---|---|---|
| `NEDARIM_MOSAD_ID` | yes | Institution number (מספר מוסד) |
| `NEDARIM_API_VALID` | yes | Iframe validation text (טקסט אימות / ApiValid) |
| `NEDARIM_API_PASSWORD` | no | Manage3 API key (`npk_…`) — live history cross-check for CallBacks from unlisted IPs |
| `NEDARIM_WEBHOOK_SECRET` | no | HMAC key for the signed CallBack URL (defaults to `JWT_SECRET`) |
| `NEDARIM_MAX_INSTALLMENTS` | no | Max installments offered at checkout (1–36, default 1) |
| `NEDARIM_GROUPE` | no | Category stamped on every store transaction in Nedarim reports |
| `NEDARIM_CALLBACK_IPS` | no | Override the documented CallBack sender IPs |
| `PUBLIC_URL` | no | Public base URL for the CallBack (defaults to the request host) |

Until `NEDARIM_MOSAD_ID` + `NEDARIM_API_VALID` are set, production checkout shows "payment unavailable"; development falls back to `POST /api/orders/mock-pay` (which returns 404 in production or once Nedarim is configured).

---

## 14.2 Payment Architecture

```
[CheckoutPage] shipping form + email (+ installments)
  │
  ├─ POST /api/payments/create-session
  │   → normalise items, check stock, recompute totals from DB
  │   → create Order { status: 'pending', payment.method: 'nedarim', payment.clientToken }
  │   → DebitIframe.aspx?Action=CreateTransaction (Mosad, ApiValid, Amount, Tashlumim,
  │     customer details, Param1 = orderId,
  │     CallBack = /api/payments/webhook?order=<id>&sig=<HMAC-SHA256(orderId)>)
  │   ← Nedarim returns transaction ID → stored as Order.payment.providerSessionId
  │
  ↓
[PaymentFrame] iframe https://www.matara.pro/nedarimplus/iframe/
  │   postMessage GetHeight → 'Height' (auto-resize)
  │   "Pay" → postMessage { Name: 'FinishTransaction', Value: <transaction ID> }
  │   ← 'TransactionResponse' { Status: 'OK' | 'Error', Message } — UI only
  │   Error → "try again" → create-session { orderId, clientToken } → new transaction ID, same order
  │
  ↓
[Nedarim Plus] charges the card → POST CallBack URL
  │
  ↓
[POST /api/payments/webhook]
  │   1. Verify HMAC signature in the URL (403 if invalid). The URL is sent to Nedarim
  │      server-to-server only — the browser never sees it.
  │   2. Status OK; Param1 / ID / Amount must match the order
  │   3. Sender IP on Nedarim's documented list — otherwise cross-check GetHistoryJson
  │      (if NEDARIM_API_PASSWORD set), else accept on the signature with a warning
  │   4. Atomic pending → paid (duplicate CallBacks are no-ops); store transactionId,
  │      confirmation, last 4 digits, installments
  │   5. Decrement stock, increment coupon usage, handleOrderPaid() (invoice + email)
  │
  ↓
[Frontend] polls GET /api/payments/:orderId/status?token=<clientToken> until paid
    → logged-in: /orders/:id   guest: inline confirmation screen
    (after 60 s without confirmation: "payment received, being verified" screen)
```

Note: Nedarim's postMessage bridge doesn't work on `localhost` — test the iframe on a deployed domain.

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

`handleOrderPaid(order)` is called by the Nedarim Plus webhook (`POST /api/payments/webhook`, §14.2) once a payment is verified — the admin endpoint refuses to set `paid`. The recipient is `order.user.email`, falling back to `order.shipping.email` for guest orders.

### Email Template Requirements
- RTL layout (`direction: rtl; text-align: right`) — implemented inline in `emailLayout()` since email clients don't load external stylesheets or resolve CSS custom properties (`var(--token)`); colours are hardcoded to match the design tokens instead.
- Hebrew font stack (system fonts as fallback)
- All templates must include the store name, legal business name, and unsubscribe link (for marketing emails only) — legal business name and unsubscribe link still TODO once those are decided (see Open Questions §20).

---

## 14.4 Invoice / Receipt Issuance — Invoicing Service Integration

**Service chosen: Green Invoice.** Implemented in `services/greenInvoiceService.js`.

### Flow (as implemented)

```
Verified Nedarim Plus webhook marks order 'paid' (POST /api/payments/webhook)
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

The Nedarim Plus webhook (§14.2) calls `handleOrderPaid(order)` directly. The Green Invoice payment line still uses `type: 1` (other); switching it to credit card (`type: 3`, with `order.payment.cardLastDigits` / `installments`) is a follow-up once the live Green Invoice account is checked.

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
