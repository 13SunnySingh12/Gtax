import { useNavigate } from 'react-router-dom';
import { ShieldX, Home } from 'lucide-react';
import { StatusScreen } from '@/components/bootstrap/StatusScreen';

export default function Forbidden() {
  const navigate = useNavigate();
  return (
    <StatusScreen
      Icon={ShieldX}
      tone="error"
      code="403"
      title="You don't have access"
      description="You're signed in, but you're not allowed to view this page."
      actions={[{ label: 'Back to dashboard', Icon: Home, onClick: () => navigate('/dashboard') }]}
    />
  );
}
