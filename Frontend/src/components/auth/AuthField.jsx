import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Labelled input with a leading lucide icon — shared by the Login, Signup and
 * Reset-password forms. When `type="password"` it renders its own independent
 * show/hide toggle, so every password field on a page toggles separately.
 */
export function AuthField({ id, label, icon: Icon, error, type = 'text', ...props }) {
  const isPassword = type === 'password';
  const [visible, setVisible] = useState(false);
  const effectiveType = isPassword && visible ? 'text' : type;

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        )}
        <Input
          id={id}
          type={effectiveType}
          className={cn(Icon && 'pl-9', isPassword && 'pr-10')}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            title={visible ? 'Hide password' : 'Show password'}
            tabIndex={0}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted',
              'transition-colors hover:text-ink focus:text-ink',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            )}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-caption text-error">{error}</p>}
    </div>
  );
}
