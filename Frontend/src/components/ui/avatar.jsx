import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Avatar primitive (converted from the supplied TS source to JSX, hand-built to
 * match the project's other UI components — no Radix/cva dependency).
 * Supports Avatar / AvatarImage / AvatarFallback. A `status` dot is available but
 * only rendered when a real status is passed (no fake online state).
 */
export function Avatar({ className, children, ...props }) {
  return (
    <span
      className={cn(
        'relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function AvatarImage({ src, alt = '', className }) {
  const [ok, setOk] = useState(Boolean(src));
  if (!src || !ok) return null;
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setOk(false)}
      className={cn('h-full w-full object-cover', className)}
    />
  );
}

export function AvatarFallback({ children, className }) {
  return (
    <span
      className={cn(
        'flex h-full w-full items-center justify-center bg-primary text-caption font-semibold text-white',
        className,
      )}
    >
      {children}
    </span>
  );
}

const STATUS = {
  online: 'bg-success',
  busy: 'bg-error',
  away: 'bg-warning',
  offline: 'bg-text-muted',
};

/** Optional status dot — pass a known status only when it reflects real state. */
export function AvatarStatus({ status, className }) {
  if (!status || !STATUS[status]) return null;
  return (
    <span
      aria-label={status}
      className={cn(
        'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white',
        STATUS[status],
        className,
      )}
    />
  );
}
