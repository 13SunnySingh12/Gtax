import { Menu } from 'lucide-react';
import { ProfileMenu } from './ProfileMenu';

export function Header({ title, onMenuClick }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="rounded-md p-2 text-primary hover:bg-sidebar lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-display text-ink">{title}</h1>
      </div>
      <ProfileMenu />
    </header>
  );
}
