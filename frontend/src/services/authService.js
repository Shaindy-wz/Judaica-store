import api from './api.js';

const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  adminLogin: (email, password) => api.post('/auth/admin-login', { email, password }),
  logout: () => api.post('/auth/logout', {}),
  me: () => api.get('/auth/me'),
};

export default authService;
