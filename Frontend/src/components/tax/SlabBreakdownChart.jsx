import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '@/services/currency';

function slabLabel(from, to) {
  if (to == null) return `${short(from)}+`;
  return `${short(from)}–${short(to)}`;
}
function short(n) {
  const v = Number(n);
  if (v >= 1000) return `${v / 1000}k`;
  return String(v);
}

/** Recharts bar of tax charged per slab (§8.5). */
export function SlabBreakdownChart({ breakdown }) {
  const data = (breakdown || []).map((b) => ({
    name: slabLabel(b.fromAmount, b.toAmount),
    rate: `${Number(b.ratePercent)}%`,
    tax: Number(b.taxForSlab),
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5B6169' }} />
          <YAxis tick={{ fontSize: 12, fill: '#5B6169' }} tickFormatter={(v) => short(v)} width={40} />
          <RTooltip
            formatter={(value) => [formatCurrency(value), 'Tax']}
            labelFormatter={(l, p) => `Slab ${l} (${p?.[0]?.payload?.rate || ''})`}
          />
          <Bar dataKey="tax" fill="#1D6DC9" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
