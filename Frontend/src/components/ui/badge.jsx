import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-surface text-primary',
  ai: 'bg-ai-accent/10 text-ai-accent border border-ai-accent/30', // AI-suggested (§6)
  success: 'bg-success/10 text-success border border-success/30',
  warning: 'bg-warning/10 text-warning border border-warning/30',
  error: 'bg-error/10 text-error border border-error/30',
  outline: 'border border-border text-primary',
};

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-caption font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
