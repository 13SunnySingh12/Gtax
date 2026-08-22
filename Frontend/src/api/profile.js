import { api } from './client';

export const profileApi = {
  get: () => api.get('/api/profile').then((r) => r.data),
  update: (payload) => api.put('/api/profile', payload).then((r) => r.data),
};
