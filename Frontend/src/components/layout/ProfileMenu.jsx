import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { DropdownItem, DropdownMenu, DropdownSeparator } from '@/components/ui/dropdown-menu';

function initials(email) {
  if (!email) return '?';
  return email.slice(0, 2).toUpperCase();
}

export function ProfileMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <DropdownMenu
      trigger={(props) => (
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-caption font-semibold text-white"
          aria-label="Open profile menu"
          {...props}
        >
          {initials(user?.email)}
        </button>
      )}
    >
      <div className="px-3 py-2 text-caption text-text-muted">{user?.email}</div>
      <DropdownSeparator />
      <DropdownItem onClick={() => navigate('/profile')}>
        <User className="h-4 w-4" /> Profile / Settings
      </DropdownItem>
      <DropdownItem onClick={handleLogout} className="text-error">
        <LogOut className="h-4 w-4" /> Log out
      </DropdownItem>
    </DropdownMenu>
  );
}
