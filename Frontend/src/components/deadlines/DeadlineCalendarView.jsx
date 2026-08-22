import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Month grid with dots on days that have a deadline (§8.7). */
export function DeadlineCalendarView({ deadlines }) {
  const first = deadlines[0] ? new Date(deadlines[0].dueDate) : new Date();
  const [cursor, setCursor] = useState(new Date(first.getFullYear(), first.getMonth(), 1));

  const byDay = useMemo(() => {
    const map = new Map();
    for (const d of deadlines) {
      const dt = new Date(d.dueDate);
      const key = `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(d);
    }
    return map;
  }, [deadlines]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const monthLabel = cursor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))} aria-label="Previous month">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-body font-medium">{monthLabel}</span>
        <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))} aria-label="Next month">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="py-1 text-caption uppercase text-text-muted">
            {w}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const key = `${year}-${month}-${day}`;
          const items = byDay.get(key);
          const cell = (
            <div
              className={cn(
                'flex aspect-square flex-col items-center justify-center rounded-md text-caption',
                items ? 'bg-surface font-medium text-ink' : 'text-primary',
              )}
            >
              {day}
              {items && <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-warning" />}
            </div>
          );
          return items ? (
            <Tooltip key={key} label={items.map((d) => d.title).join(', ')}>
              {cell}
            </Tooltip>
          ) : (
            <div key={key}>{cell}</div>
          );
        })}
      </div>
    </div>
  );
}
