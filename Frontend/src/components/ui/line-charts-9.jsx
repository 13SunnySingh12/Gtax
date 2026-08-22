import { useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/services/currency';

/**
 * Line Chart 9 — converted from the supplied TypeScript source to plain JSX.
 * The TS `ChartConfig` / `satisfies ChartConfig` becomes a normal JS object, and
 * the shadcn Chart* wrappers are adapted to raw Recharts primitives (this project
 * has no shadcn chart module). It renders as a professional financial dashboard
 * card driven by the project's REAL monthly income/expense data.
 */

// Plain JS config object (was `satisfies ChartConfig` in the TS source).
const chartConfig = {
  balance: { label: 'Net balance', color: '#1D6DC9' }, // accent token
  income: { label: 'Income', color: '#16A34A' }, // success token
  expenses: { label: 'Expenses', color: '#DC2626' }, // error token
};

function buildSeries(incomes, expenses, months) {
  const now = new Date();
  const buckets = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString('en-IN', { month: 'short' }),
      dateISO: d.toISOString(),
      income: 0,
      expenses: 0,
    });
  }
  const index = new Map(buckets.map((b) => [b.key, b]));
  const add = (list, field, dateField) => {
    for (const row of list || []) {
      const d = new Date(row[dateField]);
      const b = index.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (b) b[field] += Number(row.amount || 0);
    }
  };
  add(incomes, 'income', 'incomeDate');
  add(expenses, 'expenses', 'expenseDate');

  // Cumulative net balance across the window (the primary line).
  let running = 0;
  return buckets.map((b) => {
    const net = b.income - b.expenses;
    running += net;
    return { ...b, net, balance: running };
  });
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-white p-3 shadow-lg">
      <p className="mb-1 text-caption font-medium text-ink">{formatDate(p.dateISO)}</p>
      <dl className="flex flex-col gap-0.5 text-caption">
        <Row label={chartConfig.balance.label} value={p.balance} color={chartConfig.balance.color} />
        <Row label={chartConfig.income.label} value={p.income} color={chartConfig.income.color} />
        <Row label={chartConfig.expenses.label} value={p.expenses} color={chartConfig.expenses.color} />
      </dl>
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-1.5 text-text-muted">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </span>
      <span className="tabular font-medium text-ink">{formatCurrency(value)}</span>
    </div>
  );
}

export function LineChart9({ incomes = [], expenses = [], months = 6 }) {
  const data = useMemo(() => buildSeries(incomes, expenses, months), [incomes, expenses, months]);

  const { currentBalance, changePct, high, low, average, hasData } = useMemo(() => {
    if (!data.length) return { currentBalance: 0, changePct: 0, high: 0, low: 0, average: 0, hasData: false };
    const balances = data.map((d) => d.balance);
    const current = balances[balances.length - 1];
    const prev = balances.length > 1 ? balances[balances.length - 2] : 0;
    const pct = prev !== 0 ? ((current - prev) / Math.abs(prev)) * 100 : current !== 0 ? 100 : 0;
    const avg = balances.reduce((s, v) => s + v, 0) / balances.length;
    const activity = data.some((d) => d.income || d.expenses);
    return {
      currentBalance: current,
      changePct: pct,
      high: Math.max(...balances),
      low: Math.min(...balances),
      average: avg,
      hasData: activity,
    };
  }, [data]);

  const up = changePct >= 0;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6">
        {/* Header metrics */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-caption uppercase tracking-wide text-text-muted">Net balance</p>
            <p className="tabular text-stat text-ink">{formatCurrency(currentBalance, true)}</p>
            <p className="mt-1 text-caption text-text-muted">Income minus expenses, last {months} months</p>
          </div>
          <Badge variant={up ? 'success' : 'error'}>
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {up ? '+' : ''}
            {changePct.toFixed(1)}% MoM
          </Badge>
        </div>

        {/* Chart */}
        <div className="h-64 w-full">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <defs>
                  <linearGradient id="lc9-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartConfig.balance.color} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={chartConfig.balance.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#5B6169' }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: '#5B6169' }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={(v) => compact(v)}
                />
                <ReferenceLine y={average} stroke="#5B6169" strokeDasharray="4 4" strokeOpacity={0.5} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E5E5EA' }} />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="none"
                  fill="url(#lc9-fill)"
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  name={chartConfig.balance.label}
                  stroke={chartConfig.balance.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-md border border-dashed border-border text-caption text-text-muted">
              Add income and expenses to see your balance trend.
            </div>
          )}
        </div>

        {/* Footer stats */}
        <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
          <Stat label="High" value={high} />
          <Stat label="Low" value={low} />
          <Stat label="Average" value={average} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-caption uppercase text-text-muted">{label}</p>
      <p className="tabular text-body font-medium text-ink">{formatCurrency(value)}</p>
    </div>
  );
}

function compact(v) {
  const n = Number(v);
  const abs = Math.abs(n);
  if (abs >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}
