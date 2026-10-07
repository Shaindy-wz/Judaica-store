import crypto from 'crypto';

// Nedarim Plus — "iframe with a server-created transaction" flow:
//   1. Our server calls DebitIframe.aspx?Action=CreateTransaction with the amount,
//      the order id and a signed CallBack URL. Nedarim returns a transaction ID.
//   2. The browser hands only that ID to Nedarim's PCI iframe (FinishTransaction),
//      so the customer can't change the amount and card data never reaches us.
//   3. Nedarim POSTs the result to the CallBack URL — the only thing that may mark
//      an order 'paid' (see verifyCallback).
const CREATE_TRANSACTION_URL =
  'https://matara.pro/nedarimplus/V6/Files/WebServices/DebitIframe.aspx?Action=CreateTransaction';
const MANAGE_URL = 'https://matara.pro/nedarimplus/Reports/Manage3.aspx';
export const IFRAME_URL = 'https://www.matara.pro/nedarimplus/iframe/';

// Documented addresses Nedarim sends CallBacks from. Override with
// NEDARIM_CALLBACK_IPS (comma-separated) if they publish a new one.
const DEFAULT_CALLBACK_IPS = ['18.194.219.73', '3.70.117.239', '3.74.120.185', '18.196.146.117'];

const REQUEST_TIMEOUT_MS = 15000;

function config() {
  return {
    mosadId: process.env.NEDARIM_MOSAD_ID?.trim() || '',
    apiValid: process.env.NEDARIM_API_VALID?.trim() || '',
    // Optional, separate from ApiValid — enables a live cross-check against the
    // transaction history when a CallBack arrives from an unlisted IP.
    apiPassword: process.env.NEDARIM_API_PASSWORD?.trim() || '',
    groupe: process.env.NEDARIM_GROUPE?.trim() || '',
    maxInstallments: Math.max(1, Math.min(36, parseInt(process.env.NEDARIM_MAX_INSTALLMENTS, 10) || 1)),
    callbackIps: process.env.NEDARIM_CALLBACK_IPS
      ? process.env.NEDARIM_CALLBACK_IPS.split(',').map((ip) => ip.trim()).filter(Boolean)
      : DEFAULT_CALLBACK_IPS,
  };
}

export function isConfigured() {
  const { mosadId, apiValid } = config();
  return Boolean(mosadId && apiValid);
}

export function getMaxInstallments() {
  return config().maxInstallments;
}

// The mock checkout marks orders paid without charging anyone, so it only
// exists in development and only until a real provider is configured.
export function isMockPaymentAllowed() {
  return process.env.NODE_ENV !== 'production' && !isConfigured();
}

function webhookSecret() {
  const secret = process.env.NEDARIM_WEBHOOK_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error('NEDARIM_WEBHOOK_SECRET (or JWT_SECRET) must be set');
  return secret;
}

// The CallBack URL is sent to Nedarim server-to-server and never reaches the
// browser, so an HMAC of the order id inside it proves the request was built
// by us for this exact order.
export function signOrderId(orderId) {
  return crypto.createHmac('sha256', webhookSecret()).update(String(orderId)).digest('hex');
}

export function isValidSignature(orderId, signature) {
  if (!orderId || typeof signature !== 'string') return false;
  const expected = Buffer.from(signOrderId(orderId), 'hex');
  const received = Buffer.from(signature, 'hex');
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

async function postForm(url, params) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: new URLSearchParams(params).toString(),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Unexpected response from Nedarim Plus (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }
}

function splitName(fullName = '') {
  const [firstName = '', ...rest] = String(fullName).trim().split(/\s+/);
  return { firstName, lastName: rest.join(' ') };
}

// Returns the Nedarim transaction ID the iframe needs. Throws on failure.
export async function createTransaction({ order, installments, callbackUrl }) {
  const { mosadId, apiValid, groupe, maxInstallments } = config();
  const { firstName, lastName } = splitName(order.shipping?.name);
  const tashlumim = Math.max(1, Math.min(maxInstallments, parseInt(installments, 10) || 1));
  const orderNumber = String(order._id).slice(-8).toUpperCase();

  const data = await postForm(CREATE_TRANSACTION_URL, {
    Mosad: mosadId,
    ApiValid: apiValid,
    PaymentType: 'Ragil',
    Currency: '1', // ILS
    Amount: order.total.toFixed(2),
    Tashlumim: String(tashlumim),
    FirstName: firstName,
    LastName: lastName,
    Street: order.shipping?.address || '',
    City: order.shipping?.city || '',
    Phone: order.shipping?.phone || '',
    Mail: order.shipping?.email || '',
    Groupe: groupe,
    Comment: `הזמנה #${orderNumber}`,
    Param1: String(order._id),
    Param2: orderNumber,
    CallBack: callbackUrl,
    AjaxId: String(Date.now()),
  });

  if (data.Status !== 'OK' || !data.ID) {
    throw new Error(data.Message || 'Nedarim Plus refused to create the transaction');
  }
  return { transactionId: String(data.ID), installments: tashlumim };
}

export function sourceIp(req) {
  return (req.ip || '').replace(/^::ffff:/, '');
}

// Fields arrive with slightly different names depending on the Nedarim flow
// (iframe TransactionResponse vs institution-level webhook), so read leniently.
export function parseCallback(rawBody) {
  let body = rawBody ?? {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = Object.fromEntries(new URLSearchParams(body)); }
  }
  const pick = (...keys) => {
    for (const key of keys) {
      if (body[key] != null && body[key] !== '') return String(body[key]);
    }
    return '';
  };
  const status = pick('Status');
  const confirmation = pick('Confirmation');
  return {
    orderId: pick('Param1'),
    sessionId: pick('ID'),
    transactionId: pick('TransactionId', 'ID'),
    // The institution-level webhook has no Status field; a confirmation number means approved.
    approved: status ? status === 'OK' : Boolean(confirmation),
    message: pick('Message'),
    amount: pick('Amount'),
    confirmation,
    lastDigits: pick('LastNum'),
    installments: parseInt(pick('Tashloumim', 'Tashlumim'), 10) || undefined,
  };
}

// Server-to-server lookup of recent transactions. Nedarim rate-limits this to
// ~20 calls/hour, so it is only used as a fallback (unlisted callback IP).
async function findInHistory(callback) {
  const { mosadId, apiPassword } = config();
  const rows = await postForm(MANAGE_URL, {
    Action: 'GetHistoryJson',
    MosadId: mosadId,
    ApiPassword: apiPassword,
    MaxId: '100',
  });
  if (!Array.isArray(rows)) throw new Error(rows?.Message || 'Unexpected GetHistoryJson response');
  const ids = new Set([callback.transactionId, callback.sessionId].filter(Boolean));
  return rows.find((row) => ids.has(String(row.TransactionId)) || String(row.Param1 ?? '') === callback.orderId);
}

// Decides whether a CallBack may mark `order` paid. The caller has already
// checked the URL signature, which is the primary proof of authenticity.
export async function verifyCallback(req, callback, order) {
  const { callbackIps, apiPassword } = config();

  if (!callback.approved) {
    return { verified: false, reason: `declined: ${callback.message || 'no message'}` };
  }
  if (callback.orderId && callback.orderId !== String(order._id)) {
    return { verified: false, reason: `Param1 ${callback.orderId} does not match order ${order._id}` };
  }
  if (callback.sessionId && order.payment?.providerSessionId && callback.sessionId !== order.payment.providerSessionId) {
    return { verified: false, reason: `ID ${callback.sessionId} does not match the transaction created for this order` };
  }
  if (callback.amount && Math.abs(parseFloat(callback.amount) - order.total) > 0.01) {
    return { verified: false, reason: `amount ${callback.amount} does not match order total ${order.total}` };
  }

  const ip = sourceIp(req);
  if (callbackIps.includes(ip)) return { verified: true, reason: `trusted IP ${ip}` };

  // Unlisted IP: Nedarim may have added a server. Cross-check live if we can;
  // otherwise the signed URL alone is accepted, with a warning to update the list.
  if (apiPassword) {
    try {
      const row = await findInHistory(callback);
      if (row) return { verified: true, reason: `unlisted IP ${ip}, confirmed in Nedarim history` };
      return { verified: false, reason: `unlisted IP ${ip} and transaction not found in Nedarim history` };
    } catch (err) {
      console.warn(`[nedarim] History cross-check failed, relying on signed URL: ${err.message}`);
    }
  }
  console.warn(`[nedarim] CallBack from unlisted IP ${ip} accepted on URL signature — add it to NEDARIM_CALLBACK_IPS if it is Nedarim's`);
  return { verified: true, reason: `signed URL (unlisted IP ${ip})` };
}
