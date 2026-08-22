import { CalendarClock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/services/currency';
import { deadlineStatus } from './deadlineStatus';

/** Deadlines grouped by month, each with a status badge (§8.7). */
export function DeadlineList({ deadlines }) {
  const groups = groupByMonth(deadlines);
  return (
    <div className="flex flex-col gap-6">
      {groups.map(([month, items]) => (
        <div key={month}>
          <p className="mb-2 text-caption font-medium uppercase text-text-muted">{month}</p>
          <div className="flex flex-col gap-2">
            {items.map((d) => {
              const status = deadlineStatus(d.dueDate);
              return (
                <Card key={d.id}>
                  <CardContent className="flex items-start justify-between gap-3 pt-4">
                    <div className="flex items-start gap-3">
                      <CalendarClock className="mt-0.5 h-5 w-5 text-text-muted" />
                      <div>
                        <p className="text-body font-medium text-ink">{d.title}</p>
                        {d.description && <p className="text-caption text-text-muted">{d.description}</p>}
                        {d.applicableTo && (
                          <p className="mt-1 text-caption text-text-muted">For: {d.applicableTo}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="tabular text-caption">{formatDate(d.dueDate)}</span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupByMonth(deadlines) {
  const map = new Map();
  for (const d of deadlines) {
    const key = new Date(d.dueDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(d);
  }
  return Array.from(map.entries());
}
