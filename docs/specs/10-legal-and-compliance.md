# 10 — Legal & Compliance Requirements

> **IMPORTANT DISCLAIMER:** This document describes technical implementation requirements derived from Israeli law. It is **not legal advice**. The actual text of the Terms of Service, Privacy Policy, and Accessibility Statement must be reviewed and approved by a qualified Israeli attorney before the site goes live.

> **Language note:** All legal pages will be written in **Hebrew** as required by Israeli law for Israeli consumers.

---

## 13.1 Consumer Rights — Israeli Consumer Protection Law (Cancellation Rights)

### Background
Under Israeli Consumer Protection Law, consumers have the right to cancel a transaction within 14 business days of receiving a product, with certain exceptions.

### Implementation Requirements

**Before the user places an order (on the Checkout page and on each Product page):**
- Display a consumer rights notice via the `CancellationRightsNotice` component.
- The notice text adapts per product category:

| Product Category | Notice |
|----------------|--------|
| Regular products | "You may cancel this transaction within 14 business days of receiving the product" |
| **Holy items (Tefillin, Mezuzot)** | "This is a holy item — **returns are not possible** once the seal is broken/used" |
| **Personalised / customised items** (personalised engraving, custom Tzitzit tying, stitched labels, requested custom cuts) | "This is a **customised item and cannot be returned** per consumer protection regulations (subject to specific customisation conditions and prior approval)" |
| Other regular items | "Return/exchange is possible within 14 days if unused, unopened, and in original packaging" |

**Where to show the notice:**
1. Product page — `<CancellationRightsNotice />` component in `ProductDetails` (see §6.3)
2. Checkout page — full version before the payment step (see §6.4)
3. Shipping & Returns policy page at `/shipping-returns` — full legal text

### DB Field
The `Product.returnPolicy` object (see §9) controls what notice is displayed:
```js
returnPolicy: {
  returnable:          Boolean,  // false → show non-returnable notice
  customizable:        Boolean,  // true → "customised item" notice
  nonReturnableReason: String,   // e.g. 'חפץ קדושה — אינו ניתן להחזרה'
}
```

The `ReturnPolicyNotice` component reads these fields and renders the appropriate Hebrew notice text.

---

## 13.2 Accessibility — Israeli Accessibility Regulations (Equal Rights for Persons with Disabilities, 2013)

### Legal Requirement
The Israeli Accessibility Regulations for Internet Services (2013) require that public-facing websites targeting Israeli audiences must meet WCAG 2.1 Level AA / Israeli Standard 5568.

### Implementation Requirements

1. **Accessibility Statement page** at `/accessibility-statement` (mandatory by law) must include:
   - Conformance level claimed (AA per Standard 5568 / WCAG 2.1)
   - Date of last accessibility review
   - Contact information for accessibility issues/complaints

2. **AccessibilityWidget** (`components/layout/AccessibilityWidget.jsx`) — floating button that opens a panel with:
   - Increase / Decrease font size
   - High contrast mode toggle
   - Link highlighting toggle
   - Stop animations toggle
   - Readable / dyslexia-friendly font toggle
   - The widget supplements (does not replace) core accessibility work

3. **Baseline WCAG requirements across all components:**
   - Every `<img>` must have a meaningful `alt` attribute (or `alt=""` for decorative images)
   - Every interactive `<button>` that contains only an icon must have `aria-label`
   - Every form `<input>` must have an associated `<label>` element (or `aria-label`)
   - Keyboard focus must be visible at all times — `:focus-visible` styles are mandatory (see §9)
   - All text on coloured backgrounds must meet 4.5:1 contrast ratio (WCAG AA) — verify with WebAIM Contrast Checker

4. **Contrast validation (from §4 Design Tokens):**
   - White text on `--color-navy` → passes AA
   - Text on Hero overlay (`--color-overlay` = rgba(0,0,0,0.35)) must be verified per actual image

---

## 13.3 Privacy Policy & Marketing Consent (GDPR-adjacent)

### Privacy Policy page (`/privacy-policy`) must cover:
- What personal data is collected (name, email, address, phone)
- How it is used (order processing, communication, analytics)
- Third parties who receive data (payment provider, invoicing service, email service, analytics)
- User rights (access, correction, deletion)
- Cookie policy and analytics (Google Analytics, Meta Pixel)

### Marketing Consent Implementation
- The Register form and Checkout form **must include** an opt-in checkbox: "I agree to receive promotional marketing communications"
- This checkbox **must default to unchecked** (explicit opt-in, not opt-out)
- The user's consent choice is stored in `User.marketingConsent` (boolean)
- The `CookieConsentBanner` (see §5.15) requests consent before firing GA4 / Meta Pixel

---

## 13.4 Payment Security — PCI-DSS Compliance

### Hard Rule
**Never store, transmit, or log raw card numbers or CVV codes on our servers or in our database.** This is a legal and contractual requirement.

### Implementation
- All payment collection is handled by the payment provider's **iframe / Hosted Fields / Hosted Page** (see §11, §14.2)
- The `PaymentFrame` component renders only the provider's iframe — it does not contain any custom payment form
- The backend receives only a transaction confirmation from the provider (via webhook), never raw card data
- Choosing Cardcom / PayPlus / Tranzila / Meshulam (all are PCI-DSS certified providers) fulfils this requirement automatically

---

## 13.5 Invoice / Receipt Issuance — Israeli Tax Authority Requirements

- Israeli law requires that a receipt or tax invoice be issued for every commercial transaction.
- Our backend stack (Node.js + MongoDB) **cannot natively issue valid Israeli tax invoices** — this requires integration with a licensed invoicing SaaS: **Green Invoice**, **EZcount**, or **iCount**.
- See §11 (Payments & Invoicing) for the full integration flow.
- The invoice PDF link is stored in `Order.invoiceUrl` and emailed to the customer with the order confirmation.

> **Open question:** Which invoicing service does the business currently use or prefer? This affects integration complexity. See §20.
