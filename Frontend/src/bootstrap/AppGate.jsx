import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { WifiOff, ServerCrash, Database, RotateCcw, LogIn } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { healthApi } from '@/api/health';
import { profileApi } from '@/api/profile';
import { LoadingScreen } from '@/components/bootstrap/LoadingScreen';
import { StatusScreen } from '@/components/bootstrap/StatusScreen';
import { BootstrapContext } from './BootstrapContext';

/**
 * The pre-dashboard gate. For an authenticated user it runs once:
 *   health check (backend + DB + AI) -> profile load -> onboarding check -> ready.
 *
 * It deliberately bootstraps ONCE PER USER, not per session object. Supabase
 * refreshes its token whenever a tab regains focus, and re-running on that would
 * unmount the whole app - restarting in-flight tax calculations and AI requests
 * and flashing a loading screen every time you switched tabs.
 */
export function AppGate() {
  const { session, loading: authLoading, signOut } = useAuth();
  const online = useOnlineStatus();
  const location = useLocation();

  const [phase, setPhase] = useState('checking'); // checking|backend-down|db-down|error|onboarding|ready
  const [health, setHealth] = useState(null);
  const [profile, setProfile] = useState(null);

  const userId = session?.user?.id ?? null;
  /** The user we have already bootstrapped for - guards against re-running. */
  const bootstrappedFor = useRef(null);
  const inFlight = useRef(false);

  const run = useCallback(async (userIdToLoad) => {
    if (inFlight.current) return; // never run two bootstraps at once
    inFlight.current = true;
    // Only show the loading screen on a genuine first load. A retry or a silent
    // re-check must not blank out an already-working dashboard.
    setPhase((prev) => (prev === 'ready' ? prev : 'checking'));

    try {
      // 1) Health: backend + DB (+ AI, non-blocking). 503 = DB down (body carries detail).
      let h;
      try {
        h = await healthApi.check();
      } catch (e) {
        if (e.response?.status === 503 && e.response.data) {
          h = e.response.data;
        } else {
          setPhase('backend-down');
          return;
        }
      }
      setHealth(h);
      if (h?.database !== 'UP') {
        setPhase('db-down');
        return;
      }

      // 2) Profile / session validation. A 401 is handled by the axios interceptor
      //    (clears session, redirects to /login) - we just stop here.
      let p;
      try {
        p = await profileApi.get();
      } catch (e) {
        if (e.response?.status === 401) return;
        setPhase('error');
        return;
      }
      setProfile(p);

      // 3) Onboarding gate for new users.
      bootstrappedFor.current = userIdToLoad;
      setPhase(p.onboarded ? 'ready' : 'onboarding');
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    if (!userId || !online) return;
    // Already bootstrapped for this user? Nothing to do - this is what keeps a
    // tab switch, a minimise, or a token refresh from restarting the app.
    if (bootstrappedFor.current === userId) return;
    run(userId);
  }, [userId, online, run]);

  // Signing out should let the next user bootstrap again.
  useEffect(() => {
    if (!userId) bootstrappedFor.current = null;
  }, [userId]);

  const retry = useCallback(() => {
    bootstrappedFor.current = null;
    if (userId) run(userId);
  }, [userId, run]);

  const refreshProfile = useCallback(async () => {
    const p = await profileApi.get();
    setProfile(p);
    return p;
  }, []);

  const ctx = useMemo(
    () => ({
      health,
      profile,
      aiAvailable: health?.ai === 'UP',
      refreshProfile,
      retry,
    }),
    [health, profile, refreshProfile, retry],
  );

  // --- gate branches ---
  if (authLoading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;

  if (!online) {
    return (
      <StatusScreen
        Icon={WifiOff}
        tone="warning"
        title="You're offline"
        description="Check your internet connection. G-TAX will reconnect automatically."
        actions={[{ label: 'Retry', Icon: RotateCcw, onClick: retry }]}
      />
    );
  }

  if (phase === 'backend-down' || phase === 'error') {
    return (
      <StatusScreen
        Icon={ServerCrash}
        tone="error"
        title="Can't reach G-TAX"
        description="Our service is temporarily unavailable. Please try again in a moment."
        actions={[
          { label: 'Retry', Icon: RotateCcw, onClick: retry },
          { label: 'Log out', variant: 'secondary', Icon: LogIn, onClick: signOut },
        ]}
      />
    );
  }

  if (phase === 'db-down') {
    return (
      <StatusScreen
        Icon={Database}
        tone="error"
        title="Service temporarily unavailable"
        description="We're having trouble reaching the database. Your data is safe - please try again shortly."
        actions={[{ label: 'Retry', Icon: RotateCcw, onClick: retry }]}
      />
    );
  }

  if (phase === 'onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (phase !== 'ready') {
    return <LoadingScreen />;
  }

  return (
    <BootstrapContext.Provider value={ctx}>
      <Outlet />
    </BootstrapContext.Provider>
  );
}
