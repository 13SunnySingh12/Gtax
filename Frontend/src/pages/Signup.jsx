import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthField } from '@/components/auth/AuthField';
import { SocialButtons } from '@/components/auth/SocialButtons';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { validatePassword, PASSWORD_RULES_TEXT } from '@/lib/passwordPolicy';

export default function Signup() {
  const { signUp, session } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session) navigate('/dashboard', { replace: true });
  }, [session, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const pwError = validatePassword(password);
    if (pwError) return setError(pwError);
    if (password !== confirm) return setError('Passwords don’t match.');
    if (!agreed) return setError('Please agree to the Terms and Privacy Policy.');

    setSubmitting(true);
    // gig type is collected during onboarding; only the name is passed as metadata here.
    const { data, error: err } = await signUp(email, password, { full_name: fullName.trim() });
    setSubmitting(false);
    if (err) {
      const msg = err.message?.toLowerCase() || '';
      setError(
        msg.includes('already') || msg.includes('registered')
          ? 'An account with that email already exists.'
          : msg.includes('invalid') && msg.includes('email')
            ? 'Please enter a valid email address.'
            : msg.includes('rate limit') || err.status === 429
              ? 'Too many attempts. Please wait a minute and try again.'
              : 'We could not create your account. Please try again.',
      );
      return;
    }
    if (data?.session) {
      navigate('/dashboard', { replace: true });
    } else {
      setInfo('Check your inbox to confirm your email, then log in.');
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md rounded-2xl border bg-background shadow-md">
        <CardContent className="flex flex-col gap-6 p-6">
          <div>
            <h1 className="text-heading text-ink">Create your account</h1>
            <p className="text-caption text-text-muted">Start tracking your gig income and taxes.</p>
          </div>

          {error && <Alert variant="error">{error}</Alert>}
          {info && <Alert variant="success">{info}</Alert>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AuthField
              id="fullName"
              label="Full name"
              icon={User}
              autoComplete="name"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
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
            <div>
              <AuthField
                id="password"
                label="Password"
                icon={Lock}
                type="password"
                autoComplete="new-password"
                placeholder="Create a strong password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              placeholder="Re-enter your password"
              required
              error={confirm && confirm !== password ? 'Passwords don’t match.' : undefined}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            <label className="flex cursor-pointer items-start gap-2 text-caption text-text-muted">
              <Checkbox className="mt-0.5" checked={agreed} onCheckedChange={setAgreed} />
              <span>
                I agree to the{' '}
                <Link to="/terms" target="_blank" className="text-primary hover:underline">Terms</Link> and{' '}
                <Link to="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>.
              </span>
            </label>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </form>

          <Divider />

          <SocialButtons onError={setError} verb="Sign up with" />

          <p className="text-center text-caption text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
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
