import { api } from './client';

export const healthApi = {
  // Public composite probe: { status, database, ai, time }. 503 when DB is down.
  check: () => api.get('/api/health', { timeout: 8000 }).then((r) => r.data),
};
