import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toast';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthField } from '@/components/auth/AuthField';
import { SocialButtons } from '@/components/auth/SocialButtons';

export default function Login() {
  const { signIn, session } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true); // session persistence (default on)
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session) navigate('/dashboard', { replace: true });
  }, [session, navigate]);

  useEffect(() => {
    if (params.get('expired')) {
      toast({ variant: 'info', title: 'Your session expired', description: 'Please log in again.' });
    }
  }, [params, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await signIn(email, password);
    setSubmitting(false);
    if (err) {
      setError("That email or password doesn't match an account.");
      return;
    }
    navigate('/dashboard', { replace: true });
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md rounded-2xl border bg-background shadow-md">
        <CardContent className="flex flex-col gap-6 p-6">
          <div>
            <h1 className="text-heading text-ink">Welcome back</h1>
            <p className="text-caption text-text-muted">Log in to your G-TAX account.</p>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AuthField
              id="email"
              label="Email"
              icon={Mail}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <AuthField
              id="password"
              label="Password"
              icon={Lock}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-caption text-text-muted">
                <Checkbox checked={remember} onCheckedChange={setRemember} />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-caption font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>

          <Divider />

          <SocialButtons onError={setError} />

          <p className="text-center text-caption text-text-muted">
            New to G-TAX?{' '}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <Label className="mb-0 text-text-muted">or</Label>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
