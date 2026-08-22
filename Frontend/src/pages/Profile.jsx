import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { useBootstrapContext } from '@/bootstrap/BootstrapContext';
import { profileApi } from '@/api/profile';
import { apiErrorMessage } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/services/currency';

const GIG_TYPES = ['Freelancer', 'Delivery / Ride-share', 'Consultant', 'Creator', 'Other'];

/** Account info + editable profile (now backed by GET/PUT /api/profile) + logout. */
export default function Profile() {
  const { user, signOut } = useAuth();
  const { profile, refreshProfile } = useBootstrapContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [gigType, setGigType] = useState(profile?.gigType || GIG_TYPES[0]);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await profileApi.update({ fullName: fullName.trim(), gigType });
      await refreshProfile();
      toast({ variant: 'success', title: 'Profile updated' });
    } catch (e) {
      toast({ variant: 'error', title: 'Could not save', description: apiErrorMessage(e) });
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Profile &amp; settings</CardTitle>
        {profile?.createdAt && (
          <p className="text-caption text-text-muted">Member since {formatDate(profile.createdAt)}</p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user?.email || profile?.email || ''} readOnly />
        </div>
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Priya Sharma" />
        </div>
        <div>
          <Label htmlFor="gigType">Gig type</Label>
          <Select id="gigType" value={gigType} onChange={(e) => setGigType(e.target.value)}>
            {GIG_TYPES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
          </Button>
        </div>

        <div className="mt-2 border-t border-border pt-4">
          <Button variant="secondary" onClick={logout}>
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
