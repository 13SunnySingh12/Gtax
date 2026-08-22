import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, MailCheck } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await resetPassword(email);
    setSubmitting(false);
    // Always show success to avoid leaking which emails exist.
    if (err && !String(err.message).toLowerCase().includes('rate')) {
      setError('We couldn’t send the email right now. Please try again.');
      return;
    }
    setSent(true);
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md rounded-2xl border bg-background shadow-md">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
        </CardHeader>
        <CardContent>
          {sent ? (
            <Alert variant="success" title="Check your inbox">
              <span className="flex items-center gap-2">
                <MailCheck className="h-4 w-4" /> If an account exists for {email}, we’ve sent a reset link.
              </span>
            </Alert>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4">
              {error && <Alert variant="error">{error}</Alert>}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Send reset link
              </Button>
            </form>
          )}
          <p className="mt-4 text-center text-caption text-text-muted">
            <Link to="/login" className="font-medium text-primary hover:underline">
              Back to log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
