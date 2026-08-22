import { useDeadlines } from '@/hooks/useDeadlines';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SkeletonRows, ErrorBlock, EmptyState } from '@/components/common/States';
import { DeadlineList } from '@/components/deadlines/DeadlineList';
import { DeadlineCalendarView } from '@/components/deadlines/DeadlineCalendarView';

export default function DeadlineCalendar() {
  const { deadlines, loading, error, refetch } = useDeadlines();

  if (loading) return <SkeletonRows rows={4} />;
  if (error) return <ErrorBlock message={error} onRetry={refetch} />;
  if (deadlines.length === 0) {
    return (
      <EmptyState
        title="No deadlines to show right now"
        description="Upcoming filing and advance-tax dates will appear here as they approach."
      />
    );
  }

  return (
    <Tabs defaultValue="list">
      <TabsList>
        <TabsTrigger value="list">List</TabsTrigger>
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
      </TabsList>
      <TabsContent value="list">
        <DeadlineList deadlines={deadlines} />
      </TabsContent>
      <TabsContent value="calendar">
        <DeadlineCalendarView deadlines={deadlines} />
      </TabsContent>
    </Tabs>
  );
}
