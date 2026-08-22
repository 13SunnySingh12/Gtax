import { Card, CardContent } from '@/components/ui/card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { formatCurrency, formatPercent } from '@/services/currency';
import { SlabBreakdownChart } from './SlabBreakdownChart';

function slabRange(from, to) {
  return to == null ? `${formatCurrency(from)}+` : `${formatCurrency(from)} – ${formatCurrency(to)}`;
}

/** Estimated tax hero + slab chart + slab-by-slab math (§8.5). */
export function TaxEstimateCard({ estimate }) {
  return (
    <Card className="mx-auto max-w-2xl">
      <CardContent className="flex flex-col gap-6 pt-6">
        <div className="text-center">
          <p className="text-caption uppercase text-text-muted">
            Estimated tax · {estimate.financialYearLabel}
          </p>
          <p className="tabular text-stat text-ink">{formatCurrency(estimate.estimatedTax, true)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-caption sm:grid-cols-4">
          <Summary label="Total income" value={estimate.totalIncome} />
          <Summary label="Deductible" value={estimate.deductibleExpenses} />
          <Summary label="Std. deduction" value={estimate.standardDeduction} />
          <Summary label="Taxable income" value={estimate.taxableIncome} strong />
        </div>

        <SlabBreakdownChart breakdown={estimate.breakdown} />

        <Table>
          <THead>
            <TR>
              <TH>Slab</TH>
              <TH>Rate</TH>
              <TH className="text-right">Taxed in slab</TH>
              <TH className="text-right">Tax</TH>
            </TR>
          </THead>
          <TBody>
            {estimate.breakdown.map((b, i) => (
              <TR key={i}>
                <TD className="tabular">{slabRange(b.fromAmount, b.toAmount)}</TD>
                <TD>{formatPercent(b.ratePercent)}</TD>
                <TD className="text-right tabular">{formatCurrency(b.taxableInSlab)}</TD>
                <TD className="text-right tabular">{formatCurrency(b.taxForSlab)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function Summary({ label, value, strong }) {
  return (
    <div className="rounded-md bg-surface p-3">
      <p className="text-caption uppercase text-text-muted">{label}</p>
      <p className={`tabular ${strong ? 'text-body font-semibold text-ink' : 'text-body'}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}
