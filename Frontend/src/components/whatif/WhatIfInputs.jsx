import { RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

/** Editable hypothetical inputs (§8.6). Scoped to what /api/tax/what-if accepts. */
export function WhatIfInputs({ values, onChange, onReset }) {
  const set = (k) => (e) => onChange({ ...values, [k]: e.target.value });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Hypothetical inputs</CardTitle>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <Label htmlFor="wi-income">Total income</Label>
          <Input id="wi-income" type="number" min="0" step="0.01" value={values.totalIncome}
            onChange={set('totalIncome')} placeholder="e.g. 800000" />
        </div>
        <div>
          <Label htmlFor="wi-expenses">Total expenses</Label>
          <Input id="wi-expenses" type="number" min="0" step="0.01" value={values.totalExpenses}
            onChange={set('totalExpenses')} placeholder="e.g. 150000" />
          <p className="mt-1 text-caption text-text-muted">
            Shown for context. Only deductible expenses change the tax result.
          </p>
        </div>
        <div>
          <Label htmlFor="wi-deductible">Deductible expenses</Label>
          <Input
            id="wi-deductible"
            type="number"
            min="0"
            step="0.01"
            value={values.deductibleExpenses}
            onChange={set('deductibleExpenses')}
          />
        </div>
        <p className="text-caption text-text-muted">
          Changes here are never saved — this is a live calculation only.
        </p>
      </CardContent>
    </Card>
  );
}
