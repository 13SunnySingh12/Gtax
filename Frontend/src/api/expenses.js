import { api } from './client';

export const expensesApi = {
  list: () => api.get('/api/expenses').then((r) => r.data),
  get: (id) => api.get(`/api/expenses/${id}`).then((r) => r.data),
  create: (payload) => api.post('/api/expenses', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/api/expenses/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/api/expenses/${id}`).then((r) => r.data),
  uploadReceipt: (file, onUploadProgress) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post('/api/expenses/upload-receipt', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
        // Upload + OCR + categorise happen in one call; bound it so a hung
        // request surfaces as an error instead of spinning forever.
        timeout: 90000,
      })
      .then((r) => r.data);
  },
  deductionSuggestions: (id) =>
    api.get(`/api/expenses/${id}/deduction-suggestions`).then((r) => r.data),
};
