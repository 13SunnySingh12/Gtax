import { api } from './client';

export const deadlinesApi = {
  list: () => api.get('/api/tax/deadlines').then((r) => r.data),
};
