import api from './api.js';

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

export async function uploadImageToCloudinary(file) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(err.message);
  }

  const data = await res.json();
  return data.url; // e.g. /uploads/products/filename.jpg — served via Vite proxy in dev
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
