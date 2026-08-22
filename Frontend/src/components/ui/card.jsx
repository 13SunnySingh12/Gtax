import { cn } from '@/lib/utils';

export function Card({ className, ...props }) {
  return (
    <div
      className={cn('rounded-lg border border-border bg-white', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-1 p-6 pb-2', className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-heading text-ink', className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('text-caption text-text-muted', className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-6 pt-2', className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return <div className={cn('flex items-center gap-2 p-6 pt-0', className)} {...props} />;
}
