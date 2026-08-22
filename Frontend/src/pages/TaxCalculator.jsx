import { useNavigate } from 'react-router-dom';
import { FlaskConical, Plus } from 'lucide-react';
import { useTaxEstimate } from '@/hooks/useTaxEstimate';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBlock, EmptyState } from '@/components/common/States';
import { PageActions } from '@/components/common/PageActions';
import { TaxEstimateCard } from '@/components/tax/TaxEstimateCard';

export default function TaxCalculator() {
  const { estimate, loading, error, refetch } = useTaxEstimate();
  const navigate = useNavigate();

  const hasData =
    estimate && (Number(estimate.totalIncome) > 0 || Number(estimate.deductibleExpenses) > 0);

  return (
    <div>
      <PageActions description="A simple slab-based estimate from your income and deductible expenses.">
        <Button
          variant="secondary"
          onClick={() =>
            navigate('/tax/what-if', {
              state: estimate
                ? { totalIncome: estimate.totalIncome, deductibleExpenses: estimate.deductibleExpenses }
                : undefined,
            })
          }
        >
          <FlaskConical className="h-4 w-4" /> Try a what-if
        </Button>
      </PageActions>

      {loading && (
        <Card className="mx-auto max-w-2xl">
          <CardContent className="flex flex-col gap-4 pt-6">
            <Skeleton className="mx-auto h-10 w-48" />
            <Skeleton className="h-56 w-full" />
          </CardContent>
        </Card>
      )}
      {error && !loading && <ErrorBlock message={error} onRetry={refetch} />}
      {!loading && !error && !hasData && (
        <EmptyState
          title="No estimate yet"
          description="Once you log some income and expenses, your estimated tax for the year appears here with a slab-by-slab breakdown."
        >
          <Button variant="secondary" onClick={() => navigate('/income')}>
            <Plus className="h-4 w-4" /> Add income
          </Button>
          <Button variant="secondary" onClick={() => navigate('/expenses')}>
            <Plus className="h-4 w-4" /> Add expense
          </Button>
        </EmptyState>
      )}
      {!loading && !error && hasData && <TaxEstimateCard estimate={estimate} />}
    </div>
  );
}
