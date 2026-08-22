import { cn } from '@/lib/utils';

// 1.2s shimmer loop (§5.4); collapses to a static block under reduced-motion.
export function Skeleton({ className, ...props }) {
  return <div className={cn('animate-shimmer rounded-md bg-surface', className)} {...props} />;
}
