import { useNavigate } from 'react-router-dom';
import { TrendingUp, Receipt, Calculator, Sparkles, Plus, FlaskConical } from 'lucide-react';
import { useIncomes } from '@/hooks/useIncomes';
import { useExpenses } from '@/hooks/useExpenses';
import { useTaxEstimate } from '@/hooks/useTaxEstimate';
import { useDeadlines } from '@/hooks/useDeadlines';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/StatCard';
import { LineChart9 } from '@/components/ui/line-charts-9';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { DeadlineTeaser, DeductionTeaser } from '@/components/dashboard/Teasers';
import { PageActions } from '@/components/common/PageActions';
import { ErrorBlock } from '@/components/common/States';

export default function Dashboard() {
  const navigate = useNavigate();
  const inc = useIncomes();
  const exp = useExpenses();
  const tax = useTaxEstimate();
  const dl = useDeadlines();

  const totalIncome = inc.incomes.reduce((s, i) => s + Number(i.amount || 0), 0);
  const totalExpenses = exp.expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const deductible = exp.expenses.filter((e) => e.isDeductible);
  const deductibleTotal = deductible.reduce((s, e) => s + Number(e.amount || 0), 0);
  const isNew = !inc.loading && !exp.loading && inc.incomes.length === 0 && exp.expenses.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <PageActions description="Your income, expenses, and estimated tax at a glance.">
        <Button variant="secondary" onClick={() => navigate('/income')}>
          <Plus className="h-4 w-4" /> Add income
        </Button>
        <Button variant="secondary" onClick={() => navigate('/expenses')}>
          <Plus className="h-4 w-4" /> Add expense
        </Button>
        <Button onClick={() => navigate('/tax/what-if')}>
          <FlaskConical className="h-4 w-4" /> Run a what-if
        </Button>
      </PageActions>

      {/* Stat row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total income" value={totalIncome} loading={inc.loading} empty={isNew} Icon={TrendingUp} onClick={() => navigate('/income')} />
        <StatCard label="Total expenses" value={totalExpenses} loading={exp.loading} empty={isNew} Icon={Receipt} onClick={() => navigate('/expenses')} />
        <StatCard label="Estimated tax" value={tax.estimate?.estimatedTax} loading={tax.loading} empty={isNew} Icon={Calculator} hint={tax.estimate?.financialYearLabel} onClick={() => navigate('/tax')} />
        <StatCard label="Deductible expenses" value={deductibleTotal} loading={exp.loading} empty={isNew} Icon={Sparkles} hint={`${deductible.length} item(s)`} onClick={() => navigate('/expenses')} />
      </div>

      {inc.error && <ErrorBlock message={inc.error} onRetry={inc.refetch} />}
      {exp.error && <ErrorBlock message={exp.error} onRetry={exp.refetch} />}

      {/* Two-column area */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <LineChart9 incomes={inc.incomes} expenses={exp.expenses} />
          <RecentActivity incomes={inc.incomes} expenses={exp.expenses} />
        </div>
        <div className="flex flex-col gap-4">
          {dl.error ? (
            <ErrorBlock message={dl.error} onRetry={dl.refetch} />
          ) : (
            <DeadlineTeaser deadline={dl.deadlines[0]} />
          )}
          <DeductionTeaser deductibleCount={deductible.length} />
        </div>
      </div>
    </div>
  );
}
