import { api } from './client';

export const incomesApi = {
  list: () => api.get('/api/incomes').then((r) => r.data),
  create: (payload) => api.post('/api/incomes', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/api/incomes/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/api/incomes/${id}`).then((r) => r.data),
};
