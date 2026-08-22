import { api } from './client';

export const taxApi = {
  estimate: () => api.get('/api/tax/estimate').then((r) => r.data),
  whatIf: (payload) => api.post('/api/tax/what-if', payload).then((r) => r.data),
};
