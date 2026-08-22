import { Link } from 'react-router-dom';
import { CalendarClock, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/services/currency';
import { deadlineStatus } from '@/components/deadlines/deadlineStatus';

/** Nearest upcoming deadline with a link into the calendar (§8.2). */
export function DeadlineTeaser({ deadline }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-subheading">
          <CalendarClock className="h-4 w-4 text-text-muted" /> Upcoming deadline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deadline ? (
          <div className="flex flex-col gap-1">
            <p className="text-body font-medium text-ink">{deadline.title}</p>
            <div className="flex items-center gap-2">
              <span className="tabular text-caption text-text-muted">{formatDate(deadline.dueDate)}</span>
              <Badge variant={deadlineStatus(deadline.dueDate).variant}>
                {deadlineStatus(deadline.dueDate).label}
              </Badge>
            </div>
            <Link to="/deadlines" className="mt-2 inline-flex items-center gap-1 text-caption text-primary hover:underline">
              View calendar <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <p className="text-caption text-text-muted">No upcoming deadlines.</p>
        )}
      </CardContent>
    </Card>
  );
}

/** Count of deductible-flagged expenses, linking into the filtered list (§8.2). */
export function DeductionTeaser({ deductibleCount }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-subheading">
          <Sparkles className="h-4 w-4 text-ai-accent" /> AI deduction opportunities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-body text-ink">
          <span className="tabular text-heading font-semibold">{deductibleCount}</span> expense(s) flagged deductible
        </p>
        <Link to="/expenses" className="mt-2 inline-flex items-center gap-1 text-caption text-primary hover:underline">
          Review in Expenses <ArrowRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}
