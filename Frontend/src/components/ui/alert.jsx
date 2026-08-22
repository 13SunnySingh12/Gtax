import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const variants = {
  info: { cls: 'border-border bg-surface text-primary', Icon: Info },
  error: { cls: 'border-error/30 bg-error/5 text-error', Icon: XCircle },
  warning: { cls: 'border-warning/30 bg-warning/5 text-warning', Icon: AlertTriangle },
  success: { cls: 'border-success/30 bg-success/5 text-success', Icon: CheckCircle2 },
};

export function Alert({ className, variant = 'info', title, children, action }) {
  const { cls, Icon } = variants[variant] || variants.info;
  return (
    <div className={cn('flex items-start gap-3 rounded-md border p-3 text-body', cls, className)} role="alert">
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div className="flex-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className="text-caption opacity-90">{children}</div>}
      </div>
      {action}
    </div>
  );
}
