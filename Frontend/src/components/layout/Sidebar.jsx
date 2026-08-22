import { GradientBackground } from '@/components/ui/pipo';
import { SidebarNav } from './SidebarNav';

/**
 * Desktop sidebar (≥1024px): full-height, ~264px, with the Pipo vertical gradient
 * as its background layer. Below lg it's hidden and the mobile drawer takes over
 * (see MobileSidebar) — the two share SidebarNav so nav logic isn't duplicated.
 */
export function Sidebar({ soonDeadline }) {
  return (
    <aside className="relative hidden w-64 shrink-0 overflow-hidden border-r border-border lg:block">
      {/* Wrapper is absolute (Pipo hardcodes position:relative inline, which would
          otherwise override an `absolute` class and push the nav out of view). */}
      <div className="pointer-events-none absolute inset-0">
        <GradientBackground className="h-full w-full" />
      </div>
      <div className="relative z-10 h-full">
        <SidebarNav soonDeadline={soonDeadline} />
      </div>
    </aside>
  );
}
