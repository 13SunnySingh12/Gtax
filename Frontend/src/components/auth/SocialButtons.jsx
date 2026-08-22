import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/ui/button';

/* Brand marks kept inline (no extra asset files) — Google (multicolor), GitHub. */
function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden {...props}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}
function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden {...props}>
      <path d="M12 1.5A10.5 10.5 0 0 0 8.68 22c.53.1.72-.23.72-.5v-1.76c-2.93.64-3.55-1.4-3.55-1.4-.48-1.22-1.17-1.55-1.17-1.55-.96-.66.07-.64.07-.64 1.06.07 1.62 1.09 1.62 1.09.94 1.62 2.47 1.15 3.07.88.1-.68.37-1.15.67-1.42-2.34-.27-4.8-1.17-4.8-5.2 0-1.15.41-2.09 1.09-2.83-.11-.27-.47-1.35.1-2.82 0 0 .88-.28 2.9 1.08a10 10 0 0 1 5.28 0c2-1.36 2.89-1.08 2.89-1.08.57 1.47.21 2.55.1 2.82.68.74 1.09 1.68 1.09 2.83 0 4.04-2.47 4.93-4.82 5.19.38.33.72.98.72 1.98v2.93c0 .28.19.61.73.5A10.5 10.5 0 0 0 12 1.5Z" />
    </svg>
  );
}

const PROVIDERS = [
  { id: 'google', label: 'Google', Icon: GoogleIcon },
  { id: 'github', label: 'GitHub', Icon: GithubIcon },
];

/**
 * Google / GitHub buttons wired to the real Supabase OAuth flow via the
 * shared AuthProvider. On success the browser is redirected by Supabase; on
 * error (e.g. a provider not enabled) the message is surfaced through onError.
 */
export function SocialButtons({ onError, verb = 'Continue with' }) {
  const { signInWithProvider } = useAuth();
  const [pending, setPending] = useState(null);

  const start = async (provider) => {
    onError?.(null);
    setPending(provider);
    const { error } = await signInWithProvider(provider);
    if (error) {
      setPending(null);
      onError?.(
        `${provider[0].toUpperCase() + provider.slice(1)} sign-in isn’t available right now.`,
      );
    }
    // On success Supabase performs a full-page redirect, so no further UI needed.
  };

  return (
    <div className="flex flex-col gap-2">
      {PROVIDERS.map(({ id, label, Icon }) => (
        <Button
          key={id}
          type="button"
          variant="secondary"
          className="w-full justify-center gap-2"
          disabled={pending !== null}
          onClick={() => start(id)}
        >
          {pending === id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon />}
          {verb} {label}
        </Button>
      ))}
    </div>
  );
}
