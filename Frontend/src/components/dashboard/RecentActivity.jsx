import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/services/currency';

/** Last 5 income + expense entries, merged and sorted (§8.2). */
export function RecentActivity({ incomes, expenses }) {
  const merged = [
    ...(incomes || []).map((i) => ({
      id: `i-${i.id}`,
      kind: 'income',
      label: i.source,
      amount: i.amount,
      date: i.incomeDate,
    })),
    ...(expenses || []).map((e) => ({
      id: `e-${e.id}`,
      kind: 'expense',
      label: e.vendor || e.category || 'Expense',
      amount: e.amount,
      date: e.expenseDate,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {merged.length === 0 ? (
          <p className="text-caption text-text-muted">Nothing logged yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {merged.map((row) => (
              <li key={row.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full ${
                      row.kind === 'income' ? 'bg-success/10 text-success' : 'bg-surface text-primary'
                    }`}
                  >
                    {row.kind === 'income' ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </span>
                  <div>
                    <p className="text-body text-ink">{row.label}</p>
                    <p className="text-caption text-text-muted">{formatDate(row.date)}</p>
                  </div>
                </div>
                <span
                  className={`tabular text-body ${row.kind === 'income' ? 'text-success' : 'text-ink'}`}
                >
                  {row.kind === 'income' ? '+' : '−'}
                  {formatCurrency(row.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
