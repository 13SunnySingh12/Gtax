import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/services/currency';

/** Dashboard hero number. Empty accounts show "—" not a bare zero (§8.2). */
export function StatCard({ label, value, loading, empty, hint, Icon, onClick }) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <Wrapper
          type={onClick ? 'button' : undefined}
          onClick={onClick}
          className="flex w-full flex-col items-start gap-1 text-left"
        >
          <div className="flex items-center gap-2 text-caption uppercase text-text-muted">
            {Icon && <Icon className="h-4 w-4" />}
            {label}
          </div>
          {loading ? (
            <Skeleton className="h-9 w-28" />
          ) : (
            <span className="tabular text-stat text-ink">
              {empty ? '—' : formatCurrency(value)}
            </span>
          )}
          {hint && !loading && <span className="text-caption text-text-muted">{hint}</span>}
        </Wrapper>
      </CardContent>
    </Card>
  );
}
