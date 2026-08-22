import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthField } from '@/components/auth/AuthField';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { validatePassword, PASSWORD_RULES_TEXT } from '@/lib/passwordPolicy';

/**
 * Landing page for the Supabase password-recovery email link. The SDK
 * (detectSessionInUrl) establishes a temporary recovery session on arrival; the
 * user then sets a new password via updateUser.
 */
export default function ResetPassword() {
  const { session, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  // Give the SDK a moment to parse the recovery token from the URL.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 400);
    return () => clearTimeout(t);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const pwError = validatePassword(password);
    if (pwError) return setError(pwError);
    if (password !== confirm) return setError('Passwords don’t match.');
    setSubmitting(true);
    const { error: err } = await updatePassword(password);
    setSubmitting(false);
    if (err) return setError('Could not update your password. The link may have expired — request a new one.');
    setDone(true);
    setTimeout(() => navigate('/dashboard', { replace: true }), 1200);
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md rounded-2xl border bg-background shadow-md">
        <CardHeader>
          <CardTitle>Set a new password</CardTitle>
        </CardHeader>
        <CardContent>
          {done ? (
            <Alert variant="success" title="Password updated">Redirecting you to your dashboard…</Alert>
          ) : ready && !session ? (
            <Alert variant="error" title="Link expired or invalid">
              Please request a new reset link.
              <div className="mt-2">
                <Link to="/forgot-password" className="font-medium text-primary hover:underline">
                  Request new link
                </Link>
              </div>
            </Alert>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4">
              {error && <Alert variant="error">{error}</Alert>}
              <div>
                <AuthField
                  id="password"
                  label="New password"
                  icon={Lock}
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                />
                <PasswordStrength value={password} />
                <p className="mt-1 text-caption text-text-muted">{PASSWORD_RULES_TEXT}</p>
              </div>
              <AuthField
                id="confirm"
                label="Confirm password"
                icon={Lock}
                type="password"
                autoComplete="new-password"
                required
                error={confirm && confirm !== password ? 'Passwords don’t match.' : undefined}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
              />
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Update password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
