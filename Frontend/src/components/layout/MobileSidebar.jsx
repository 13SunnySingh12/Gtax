import { Sheet } from '@/components/ui/sheet';
import { GradientBackground } from '@/components/ui/pipo';
import { SidebarNav } from './SidebarNav';

/**
 * Mobile/tablet navigation drawer (<1024px). Reuses the shared Sheet (left side)
 * and the same SidebarNav + Pipo gradient as the desktop sidebar, so navigation
 * and active states are never duplicated. Tapping a link closes the drawer.
 */
export function MobileSidebar({ open, onOpenChange, soonDeadline }) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      side="left"
      className="max-w-[280px]"
      bodyClassName="relative flex-1 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0">
        <GradientBackground className="h-full w-full" />
      </div>
      <div className="relative z-10 h-full">
        <SidebarNav soonDeadline={soonDeadline} onNavigate={() => onOpenChange(false)} />
      </div>
    </Sheet>
  );
}
