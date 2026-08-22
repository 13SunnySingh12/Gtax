import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { Header } from '@/components/layout/Header';
import { useDeadlines, hasSoonDeadline } from '@/hooks/useDeadlines';
import { useBootstrapContext } from '@/bootstrap/BootstrapContext';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/income': 'Income',
  '/expenses': 'Expenses',
  '/tax': 'Tax Calculator',
  '/tax/what-if': 'What-If Simulator',
  '/deadlines': 'Deadline Calendar',
  '/chat': 'AI Tax Q&A',
  '/profile': 'Profile',
};

/**
 * App layout: Pipo-gradient sidebar (desktop) + drawer (mobile) sharing one
 * SidebarNav, header with a mobile menu button, and the routed page content.
 */
export function AppShell() {
  const { pathname } = useLocation();
  const { deadlines } = useDeadlines();
  const { aiAvailable } = useBootstrapContext();
  const soon = hasSoonDeadline(deadlines);
  const title = TITLES[pathname] || 'G-TAX';

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // Close the drawer on route change.
  useEffect(() => setMobileNavOpen(false), [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar soonDeadline={soon} />
      <MobileSidebar open={mobileNavOpen} onOpenChange={setMobileNavOpen} soonDeadline={soon} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} onMenuClick={() => setMobileNavOpen(true)} />
        {/* AI is non-blocking (PRD principle 3): warn but never block the app. */}
        {!aiAvailable && (
          <div className="flex items-center gap-2 border-b border-warning/30 bg-warning/5 px-4 py-2 text-caption text-warning lg:px-6">
            <Sparkles className="h-4 w-4 shrink-0" />
            AI features (receipt scanning, categorization, chat) are temporarily unavailable. You can
            still track income and expenses normally.
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
