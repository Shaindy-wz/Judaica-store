const PROD_BASE_URL = 'https://api.greeninvoice.co.il/api/v1';
const SANDBOX_BASE_URL = 'https://sandbox.d.greeninvoice.co.il/api/v1';

function getBaseUrl() {
  return process.env.GREEN_INVOICE_ENV === 'production' ? PROD_BASE_URL : SANDBOX_BASE_URL;
}

let cachedToken = null;
let cachedTokenExpiry = 0;

async function getToken() {
  if (cachedToken && Date.now() < cachedTokenExpiry) return cachedToken;

  const res = await fetch(`${getBaseUrl()}/account/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: process.env.GREEN_INVOICE_API_KEY,
      secret: process.env.GREEN_INVOICE_API_SECRET,
    }),
  });

  if (!res.ok) throw new Error(`Green Invoice auth failed: ${res.status} ${await res.text()}`);

  const data = await res.json();
  cachedToken = data.token;
  // Documented token lifetime is 24h; refresh a bit early to avoid edge-of-expiry failures.
  cachedTokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
  return cachedToken;
}

function isConfigured() {
  return Boolean(process.env.GREEN_INVOICE_API_KEY && process.env.GREEN_INVOICE_API_SECRET);
}

/**
 * Creates a tax invoice/receipt for a paid order via Green Invoice.
 * Returns null (and logs a warning) if credentials aren't configured, so local/dev
 * environments without a Green Invoice account don't block order processing.
 */
export async function createInvoiceForOrder(order) {
  if (!isConfigured()) {
    console.warn('[greenInvoice] Credentials not configured — skipping invoice creation');
    return null;
  }

  const token = await getToken();

  const docType = Number(process.env.GREEN_INVOICE_DOC_TYPE) || 400; // 400 = חשבונית מס קבלה (tax invoice + receipt)
  const vatType = Number(process.env.GREEN_INVOICE_VAT_TYPE ?? 0); // 0 = VAT included/calculated, 2 = עוסק פטור (exempt)

  const customerName =
    order.shipping?.name || `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'לקוח';
  const customerEmail = order.user?.email;

  const income = order.items.map((item) => ({
    description: item.name,
    quantity: item.quantity,
    price: item.price,
    currency: 'ILS',
    vatType,
  }));

  if (order.shippingCost) {
    income.push({ description: 'משלוח', quantity: 1, price: order.shippingCost, currency: 'ILS', vatType });
  }
  if (order.discount) {
    income.push({ description: 'הנחה', quantity: 1, price: -order.discount, currency: 'ILS', vatType });
  }

  const payload = {
    type: docType,
    lang: 'he',
    currency: 'ILS',
    client: {
      name: customerName,
      emails: customerEmail ? [customerEmail] : undefined,
      address: order.shipping?.address,
      city: order.shipping?.city,
    },
    income,
    payment: [{ type: 1, price: order.total, currency: 'ILS' }], // type 1 = "other" — actual charge was processed by the payment provider
    remarks: `הזמנה מספר ${order._id}`,
  };

  const res = await fetch(`${getBaseUrl()}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Green Invoice document creation failed: ${res.status} ${await res.text()}`);

  const doc = await res.json();
  return {
    invoiceNumber: doc.number != null ? String(doc.number) : doc.id,
    invoiceUrl: doc.url?.origin || doc.url?.he || doc.url?.en,
  };
}
