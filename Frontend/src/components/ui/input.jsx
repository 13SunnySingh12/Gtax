import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef(function Input({ className, type = 'text', ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'h-10 w-full rounded-md border border-border bg-surface px-3 text-body text-ink',
        'placeholder:text-text-muted focus:bg-white',
        'disabled:cursor-not-allowed disabled:opacity-60 tabular',
        className,
      )}
      {...props}
    />
  );
});
