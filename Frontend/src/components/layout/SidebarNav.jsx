import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/auth/AuthProvider';
import { useBootstrapContext } from '@/bootstrap/BootstrapContext';
import { Logo } from '@/components/ui/logo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { navGroups, systemItems } from './navItems';

/**
 * Shared sidebar content (brand + grouped nav + user profile), used by BOTH the
 * desktop sidebar and the mobile drawer so navigation logic isn't duplicated.
 * Rendered above the Pipo gradient; dark text reads cleanly on the light gradient.
 */
export function SidebarNav({ soonDeadline, onNavigate }) {
  const { user, signOut } = useAuth();
  const { profile } = useBootstrapContext();
  const navigate = useNavigate();

  const email = user?.email || profile?.email || '';
  const name = profile?.fullName?.trim() || email.split('@')[0] || 'Your account';
  const initials = (profile?.fullName || email || '?').slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    onNavigate?.();
    await signOut();
    navigate('/login', { replace: true });
  };

  const linkClass = ({ isActive }) =>
    cn(
      'group flex items-center gap-3 rounded-md px-3 py-2 text-label transition-colors',
      isActive
        ? 'bg-white font-medium text-primary shadow-sm'
        : 'text-primary/80 hover:bg-white/60 hover:text-primary',
    );

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-6 px-2 py-1">
        <Logo size={32} />
      </div>

      <nav aria-label="Primary" className="flex flex-1 flex-col gap-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-primary/50">
              {group.label}
            </p>
            <div className="flex flex-col gap-1">
              {group.items.map(({ to, label, Icon, end, badgeKey }) => (
                <NavLink key={to} to={to} end={end} onClick={onNavigate} className={linkClass}>
                  <span className="relative">
                    <Icon className="h-5 w-5" aria-hidden />
                    {badgeKey === 'deadlines' && soonDeadline && (
                      <span
                        className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-warning"
                        aria-label="A deadline is coming up soon"
                      />
                    )}
                  </span>
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-4 flex flex-col gap-1 border-t border-primary/10 pt-3">
        {systemItems.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} onClick={onNavigate} className={linkClass}>
            <Icon className="h-5 w-5" aria-hidden />
            {label}
          </NavLink>
        ))}
      </div>

      {/* User profile — real authenticated user, real logout */}
      <div className="mt-3 flex items-center gap-3 rounded-lg bg-white/50 p-2">
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-caption font-medium text-primary">{name}</p>
          <p className="truncate text-[11px] text-primary/60">{email}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          className="rounded-md p-1.5 text-primary/70 hover:bg-white hover:text-error"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
