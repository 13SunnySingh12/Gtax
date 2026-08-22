import { passwordStrength } from '@/lib/passwordPolicy';
import { cn } from '@/lib/utils';

const CONFIG = {
  weak: { label: 'Weak', bars: 1, color: 'bg-error', text: 'text-error' },
  medium: { label: 'Medium', bars: 2, color: 'bg-warning', text: 'text-warning' },
  strong: { label: 'Strong', bars: 3, color: 'bg-success', text: 'text-success' },
};

/**
 * Compact 3-segment strength meter shown under a new-password field. Renders
 * nothing until the user starts typing, so it never crowds an empty form.
 */
export function PasswordStrength({ value }) {
  const level = passwordStrength(value);
  if (!level) return null;
  const { label, bars, color, text } = CONFIG[level];

  return (
    <div className="mt-1.5" aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn('h-1 flex-1 rounded-full transition-colors', i < bars ? color : 'bg-border')}
          />
        ))}
      </div>
      <p className={cn('mt-1 text-caption', text)}>Password strength: {label}</p>
    </div>
  );
}
