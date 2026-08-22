import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const tones = {
  error: 'bg-error/10 text-error',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-surface text-primary',
  success: 'bg-success/10 text-success',
};

/**
 * Full-screen status/error page reused by every fallback (backend/DB/AI down,
 * offline, 401/403/404/500, session expired). Clear message + recovery actions.
 */
export function StatusScreen({ Icon, tone = 'error', code, title, description, actions = [] }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background p-6 text-center">
      {Icon && (
        <span className={cn('flex h-16 w-16 items-center justify-center rounded-full', tones[tone])}>
          <Icon className="h-8 w-8" aria-hidden />
        </span>
      )}
      {code && <span className="text-caption font-medium uppercase tracking-wide text-text-muted">{code}</span>}
      <h1 className="text-display text-ink">{title}</h1>
      {description && <p className="max-w-md text-body text-text-muted">{description}</p>}
      {actions.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {actions.map((a) => (
            <Button key={a.label} variant={a.variant || 'primary'} onClick={a.onClick}>
              {a.Icon && <a.Icon className="h-4 w-4" />}
              {a.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
