import api from './api.js';
import { compressImage } from '../utils/compressImage.js';

// Dashboard
export const getDashboard = () => api.get('/admin/dashboard');

// Products
export const getAdminProducts = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return api.get(`/admin/products${qs ? `?${qs}` : ''}`);
};
export const createProduct = (data) => api.post('/admin/products', data);
export const updateProduct = (id, data) => api.put(`/admin/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/admin/products/${id}`);
// dryRun: true validates and previews without saving; on a 400 the thrown
// error carries the server's `errors` / `summary` fields.
export const importProducts = (rows, dryRun) => api.post('/admin/products/import', { rows, dryRun });

// A free-plan server that was asleep answers 502/503 or drops the connection
// while it boots (~50s); those uploads are retried instead of failing.
const RETRY_DELAYS_MS = [3000, 8000, 15000, 25000];
const isTransient = (err) => err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function uploadImage(file) {
  const prepared = await compressImage(file);
  for (let attempt = 0; ; attempt++) {
    const formData = new FormData();
    formData.append('file', prepared);
    try {
      const data = await api.upload('/admin/upload', formData);
      if (!data?.url) throw new Error('העלאת התמונה נכשלה');
      return data.url; // e.g. /api/images/<id>
    } catch (err) {
      if (!isTransient(err) || attempt >= RETRY_DELAYS_MS.length) {
        throw new Error(`"${file.name}": ${err.message}`, { cause: err });
      }
      await wait(RETRY_DELAYS_MS[attempt]);
    }
  }
}

// Uploads several images a few at a time; onProgress(done, total).
export async function uploadImages(files, onProgress) {
  const results = new Array(files.length);
  let next = 0;
  let done = 0;
  async function worker() {
    while (next < files.length) {
      const i = next++;
      try {
        results[i] = { status: 'fulfilled', value: await uploadImage(files[i]) };
      } catch (reason) {
        results[i] = { status: 'rejected', reason };
      }
      onProgress?.(++done, files.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, files.length) }, worker));
  return results;
}

// Orders
export const getAdminOrders = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return api.get(`/admin/orders${qs ? `?${qs}` : ''}`);
};
export const getAdminOrder = (id) => api.get(`/admin/orders/${id}`);
export const updateOrderStatus = (id, body) => api.put(`/admin/orders/${id}/status`, body);

// Categories
export const getAdminCategories = () => api.get('/admin/categories');
export const createCategory = (data) => api.post('/admin/categories', data);
export const updateCategory = (id, data) => api.put(`/admin/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`);

// Coupons
export const getAdminCoupons = () => api.get('/admin/coupons');
export const createCoupon = (data) => api.post('/admin/coupons', data);
export const updateCoupon = (id, data) => api.put(`/admin/coupons/${id}`, data);
export const deleteCoupon = (id) => api.delete(`/admin/coupons/${id}`);

// Reviews
export const getAdminReviews = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return api.get(`/admin/reviews${qs ? `?${qs}` : ''}`);
};
export const approveReview = (id) => api.put(`/admin/reviews/${id}/approve`, {});
export const rejectReview = (id) => api.put(`/admin/reviews/${id}/reject`, {});

// Customers
export const getAdminCustomers = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return api.get(`/admin/customers${qs ? `?${qs}` : ''}`);
};
export const getCustomerOrders = (id) => api.get(`/admin/customers/${id}/orders`);
