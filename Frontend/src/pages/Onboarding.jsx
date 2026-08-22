import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Loader2, LogOut } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { profileApi } from '@/api/profile';
import { apiErrorMessage } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import { LoadingScreen } from '@/components/bootstrap/LoadingScreen';

const GIG_TYPES = ['Freelancer', 'Delivery / Ride-share', 'Consultant', 'Creator', 'Other'];

/**
 * First-run setup for new users (brief §4): profile completion + Terms/Privacy
 * consent. Persisted server-side via PUT /api/profile (sets onboarded=true), so
 * the gate lets them into the dashboard afterwards.
 */
export default function Onboarding() {
  const { session, user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [gigType, setGigType] = useState(GIG_TYPES[0]);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(true);

  // If they already onboarded (e.g. opened this URL directly), skip to dashboard.
  useEffect(() => {
    if (!session) return;
    let active = true;
    profileApi
      .get()
      .then((p) => {
        if (!active) return;
        if (p.onboarded) navigate('/dashboard', { replace: true });
        else {
          setFullName(p.fullName || user?.user_metadata?.full_name || '');
          if (p.gigType || user?.user_metadata?.gig_type) {
            setGigType(p.gigType || user.user_metadata.gig_type);
          }
          setChecking(false);
        }
      })
      .catch(() => active && setChecking(false));
    return () => {
      active = false;
    };
  }, [session, user, navigate]);

  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;
  if (checking) return <LoadingScreen />;

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) return setError('Please tell us your name.');
    if (!accepted) return setError('Please accept the Terms and Privacy Policy to continue.');
    setSubmitting(true);
    try {
      await profileApi.update({ fullName: fullName.trim(), gigType, acceptTerms: true });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save your details. Please try again.'));
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-[440px]">
        <CardHeader>
          <CardTitle>Welcome to G-TAX 👋</CardTitle>
          <p className="text-caption text-text-muted">A couple of quick details to set up your account.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="flex flex-col gap-4">
            {error && <Alert variant="error">{error}</Alert>}
            <div>
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Priya Sharma" />
            </div>
            <div>
              <Label htmlFor="gigType">What kind of gig work do you do?</Label>
              <Select id="gigType" value={gigType} onChange={(e) => setGigType(e.target.value)}>
                {GIG_TYPES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </Select>
            </div>
            <label className="flex items-start gap-2 text-caption text-text-muted">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <span>
                I agree to the{' '}
                <Link to="/terms" target="_blank" className="text-primary hover:underline">Terms</Link> and{' '}
                <Link to="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>.
              </span>
            </label>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Continue to dashboard
            </Button>
          </form>
          <button
            type="button"
            onClick={signOut}
            className="mt-4 flex w-full items-center justify-center gap-1 text-caption text-text-muted hover:text-primary"
          >
            <LogOut className="h-3 w-3" /> Log out
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
