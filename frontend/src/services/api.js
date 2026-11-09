const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

// The server answers in Hebrew; these cover the cases where it did not (or
// could not) — so an admin never sees "Request failed" or "I'm a teapot".
const STATUS_MESSAGES = {
  401: 'ההתחברות פגה — יש להתחבר מחדש ולנסות שוב',
  403: 'אין הרשאה לפעולה הזו — יש להתחבר כמנהל',
  413: 'הקובץ גדול מדי לשליחה',
  502: 'השרת מתעורר — נסו שוב בעוד דקה',
  503: 'השרת מתעורר — נסו שוב בעוד דקה',
  504: 'השרת לא הגיב בזמן — נסו שוב בעוד דקה',
};
const NETFREE_MESSAGE =
  'הסינון של נטפרי חסם את הפעולה. יש לפנות לנטפרי ולבקש לפתוח את האתר talidika.co.il (כולל העלאת קבצים ותמונות), ואז לנסות שוב.';
const OFFLINE_MESSAGE = 'אין חיבור לשרת — בדקו את חיבור האינטרנט ונסו שוב';

// English messages the server may still send for auth failures.
const ENGLISH_AUTH = /^(Authentication required|Invalid or expired token|Admin access required)$/;

function errorFor(res, body) {
  // NetFree answers blocked requests itself, with HTTP 418 and this flag.
  if (body?.blockByNetFree || res.status === 418) {
    return Object.assign(new Error(NETFREE_MESSAGE), { status: res.status, netfree: true });
  }
  const fallback = STATUS_MESSAGES[res.status] || `הפעולה נכשלה (שגיאה ${res.status}). נסו שוב`;
  const serverMessage = typeof body?.message === 'string' ? body.message : '';
  let message = fallback;
  if (serverMessage && /[֐-׿]/.test(serverMessage)) message = serverMessage;
  // An English technical message is kept in brackets, for whoever debugs it.
  else if (serverMessage && !ENGLISH_AUTH.test(serverMessage) && !STATUS_MESSAGES[res.status]) {
    message = `${fallback} (${serverMessage})`;
  }
  const err = new Error(message);
  Object.assign(err, body, { message, status: res.status }); // keep extra fields like outOfStock[]
  return err;
}

async function request(path, options = {}) {
  // FormData needs the browser to set its own multipart Content-Type (with boundary).
  const isFormData = options.body instanceof FormData;
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    });
  } catch {
    throw Object.assign(new Error(OFFLINE_MESSAGE), { status: 0 });
  }

  const text = await res.text().catch(() => '');
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!res.ok) throw errorFor(res, body);
  if (body?.blockByNetFree) throw errorFor(res, body);

  if (res.status === 204 || !text) return null;
  // A non-JSON success body means we didn't reach the API (e.g. a proxy or static host answered).
  if (body === null) throw new Error('תגובה לא תקינה מהשרת');
  return body;
}

export default {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  upload: (path, formData) => request(path, { method: 'POST', body: formData }),
};
