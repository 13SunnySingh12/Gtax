import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { LoadingScreen } from '@/components/bootstrap/LoadingScreen';

/**
 * UX guard only — real enforcement is server-side (Spring Boot JWT + RLS, §14).
 * Redirects to /login when there's no session, so authed screens never flash.
 */
export function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // One shared loader for the whole app - no duplicate loading UIs.
    return <LoadingScreen />;
  }
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
