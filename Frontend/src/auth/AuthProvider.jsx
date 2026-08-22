import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext(null);

/**
 * Holds the Supabase session (JWT + user) in React context. The JWT here is the
 * one attached to every Spring Boot request (TRD §10); login/signup/logout all
 * go directly through the Supabase Auth SDK, never through Spring Boot.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Supabase re-emits auth events (TOKEN_REFRESHED / SIGNED_IN) whenever the tab
    // regains focus. Storing the new object every time changed the session's
    // IDENTITY, which restarted anything keyed on it - that is what made the app
    // re-initialise on every tab switch. Only store a genuinely different session.
    const sameSession = (a, b) =>
      a?.access_token === b?.access_token && a?.user?.id === b?.user?.id;

    supabase.auth.getSession().then(({ data }) => {
      setSession((prev) => (sameSession(prev, data.session) ? prev : data.session));
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession((prev) => (sameSession(prev, next) ? prev : next));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
      signUp: (email, password, meta) =>
        supabase.auth.signUp({ email, password, options: { data: meta } }),
      // Social login via the Supabase Auth SDK. Providers must be enabled in the
      // Supabase dashboard; if one isn't, Supabase returns an error we surface.
      signInWithProvider: (provider) =>
        supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo: `${window.location.origin}/dashboard` },
        }),
      signOut: () => supabase.auth.signOut(),
      // Password recovery (email link) — handled entirely by the Supabase Auth SDK.
      resetPassword: (email) =>
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        }),
      updatePassword: (password) => supabase.auth.updateUser({ password }),
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
