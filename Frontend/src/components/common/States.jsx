import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

/** Skeleton rows for tables/lists during first load. */
export function SkeletonRows({ rows = 5 }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

/** Inline error with a retry action (§19). */
export function ErrorBlock({ message, onRetry }) {
  return (
    <Alert
      variant="error"
      title="Something went wrong"
      action={
        onRetry && (
          <Button size="sm" variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        )
      }
    >
      {message}
    </Alert>
  );
}

/** Friendly empty state — an invitation to act, not a dead end (§8.3). */
export function EmptyState({ title, description, children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-10 text-center">
      <p className="text-heading text-ink">{title}</p>
      {description && <p className="max-w-sm text-caption text-text-muted">{description}</p>}
      {children && <div className="mt-2 flex gap-2">{children}</div>}
    </div>
  );
}
