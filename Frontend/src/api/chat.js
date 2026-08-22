import { api } from './client';

export const chatApi = {
  ask: (question) => api.post('/api/chat/ask', { question }).then((r) => r.data),
};
