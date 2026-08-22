import axios from 'axios';
import { supabase } from '@/auth/supabaseClient';

/**
 * Shared axios instance for every Spring Boot call. Attaches the Supabase JWT as
 * a Bearer token on each request (TRD §10) and, on a 401, clears the session and
 * bounces to /login rather than showing a broken authenticated screen (§14).
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login?expired=1');
      }
    }
    return Promise.reject(error);
  },
);

/** Normalize an axios error into a user-facing message. */
export function apiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}
