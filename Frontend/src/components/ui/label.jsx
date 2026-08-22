import { cn } from '@/lib/utils';

// Persistent, associated labels — no placeholder-as-label (§17).
export function Label({ className, ...props }) {
  return (
    <label className={cn('mb-1 block text-label text-primary', className)} {...props} />
  );
}
