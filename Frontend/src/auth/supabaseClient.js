import { createClient } from '@supabase/supabase-js';

// Only VITE_* keys are exposed to the browser. The anon key is safe to ship;
// the service-role key and JWT secret live server-side only (never here).
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Surface a clear message rather than a cryptic runtime error deep in a page.
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase env not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the root .env',
  );
}

export const supabase = createClient(url || 'http://localhost', anonKey || 'public-anon-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
