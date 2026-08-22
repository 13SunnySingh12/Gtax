import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/services/currency';

/**
 * Current vs. Simulated estimate with a delta pill — green if lower, red if
 * higher (§8.6/§11). Never the brand accent: this isn't a CTA and isn't AI.
 */
export function WhatIfComparison({ current, simulated, loading, error }) {
  const currentTax = Number(current?.estimatedTax ?? 0);
  const simulatedTax = Number(simulated?.estimatedTax ?? 0);
  const delta = simulatedTax - currentTax;
  const lower = delta < 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimated tax</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-md bg-surface p-4">
            <p className="text-caption uppercase text-text-muted">Current</p>
            <p className="tabular text-stat text-ink">{formatCurrency(currentTax)}</p>
          </div>
          <div className="rounded-md bg-surface p-4">
            <p className="text-caption uppercase text-text-muted">Simulated</p>
            {loading ? (
              <Skeleton className="mt-1 h-8 w-28" />
            ) : (
              <p className="tabular text-stat text-ink transition-opacity">{formatCurrency(simulatedTax)}</p>
            )}
          </div>
        </div>

        {error ? (
          <Alert variant="error">{error}</Alert>
        ) : (
          !loading && (
            <div
              className={cn(
                'inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-caption font-medium',
                delta === 0
                  ? 'bg-surface text-text-muted'
                  : lower
                    ? 'bg-success/10 text-success'
                    : 'bg-error/10 text-error',
              )}
            >
              {delta !== 0 && (lower ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />)}
              {delta === 0
                ? 'No change'
                : `${lower ? 'Save' : 'Pay'} ${formatCurrency(Math.abs(delta))} vs. current`}
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
