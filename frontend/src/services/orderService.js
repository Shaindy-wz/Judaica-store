import api from './api';

function create(order) {
  return api.post('/orders', order);
}

function myOrders() {
  return api.get('/orders/my');
}

function getById(id) {
  return api.get(`/orders/${id}`);
}

export default { create, myOrders, getById };
