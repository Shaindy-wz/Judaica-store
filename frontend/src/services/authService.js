import api from './api';

async function login(email, password) {
  const data = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', data.token);
  return data.user;
}

async function register(payload) {
  const data = await api.post('/auth/register', payload);
  localStorage.setItem('token', data.token);
  return data.user;
}

async function me() {
  return api.get('/auth/me');
}

function logout() {
  localStorage.removeItem('token');
}

export default { login, register, me, logout };
