// Urgency computed client-side from due_date (§8.7): overdue / soon / upcoming.
export function deadlineStatus(dueDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const days = Math.round((due - now) / (1000 * 60 * 60 * 24));
  if (days < 0) return { key: 'overdue', label: 'Overdue', variant: 'error' };
  if (days <= 7) return { key: 'soon', label: `Due in ${days}d`, variant: 'warning' };
  return { key: 'upcoming', label: 'Upcoming', variant: 'default' };
}
