import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Buttons are neutral by default: white surface + hairline border + dark text,
 * with the SIDEBAR colour appearing only on hover. `primary` and `secondary`
 * are intentionally identical so every action button reads the same (no filled
 * accent buttons). `destructive` and `ai` stay coloured because their colour is
 * semantic (danger / AI-generated), not decoration.
 */
const NEUTRAL = 'bg-white text-primary border border-primary/20 hover:bg-sidebar hover:border-primary/30';

const variants = {
  primary: NEUTRAL,
  secondary: NEUTRAL,
  ghost: 'bg-transparent text-primary hover:bg-sidebar',
  destructive: 'bg-error text-white hover:bg-error/90',
  ai: 'bg-ai-accent text-white hover:bg-ai-accent/90',
};

const sizes = {
  sm: 'h-8 px-3 text-caption',
  md: 'h-10 px-4 text-body',
  lg: 'h-11 px-5 text-body',
  icon: 'h-9 w-9',
};

export const Button = forwardRef(function Button(
  { className, variant = 'primary', size = 'md', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium',
        'transition-colors disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});
