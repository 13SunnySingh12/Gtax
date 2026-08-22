import { cn } from '@/lib/utils';

export function Table({ className, ...props }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full border-collapse text-body', className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }) {
  return <thead className={cn('border-b border-border', className)} {...props} />;
}

export function TBody({ className, ...props }) {
  return <tbody className={className} {...props} />;
}

export function TR({ className, ...props }) {
  return <tr className={cn('border-b border-border last:border-0', className)} {...props} />;
}

export function TH({ className, ...props }) {
  return (
    <th
      className={cn(
        'px-3 py-2 text-left text-caption font-medium uppercase tracking-wide text-text-muted',
        className,
      )}
      {...props}
    />
  );
}

export function TD({ className, ...props }) {
  return <td className={cn('px-3 py-3 align-middle', className)} {...props} />;
}
