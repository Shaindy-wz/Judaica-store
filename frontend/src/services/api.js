const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

async function request(path, options = {}) {
  // FormData needs the browser to set its own multipart Content-Type (with boundary).
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    const err = new Error(body.message || 'Request failed');
    Object.assign(err, body); // preserve extra fields like outOfStock[]
    throw err;
  }

  if (res.status === 204) return null;
  // An empty or non-JSON success body means we didn't reach the API (e.g. a proxy or static host answered).
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('תגובה לא תקינה מהשרת');
  }
}

export default {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  upload: (path, formData) => request(path, { method: 'POST', body: formData }),
};
