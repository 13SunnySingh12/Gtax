import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  Calculator,
  FlaskConical,
  CalendarClock,
  MessageSquareText,
  User,
} from 'lucide-react';

// Grouped navigation — ONLY real, existing routes (no invented pages).
// `end` keeps /tax active only on exact match (not /tax/what-if).
// `badgeKey: 'deadlines'` shows the "soon" dot.
export const navGroups = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
      { to: '/income', label: 'Income', Icon: TrendingUp },
      { to: '/expenses', label: 'Expenses', Icon: Receipt },
    ],
  },
  {
    label: 'Tax',
    items: [
      { to: '/tax', label: 'Tax Estimate', Icon: Calculator, end: true },
      { to: '/tax/what-if', label: 'Tax Simulator', Icon: FlaskConical },
      { to: '/deadlines', label: 'Deadlines', Icon: CalendarClock, badgeKey: 'deadlines' },
    ],
  },
  {
    label: 'Assistant',
    items: [{ to: '/chat', label: 'AI Chat', Icon: MessageSquareText }],
  },
];

// Rendered above the user profile block.
export const systemItems = [{ to: '/profile', label: 'Profile & Settings', Icon: User }];
