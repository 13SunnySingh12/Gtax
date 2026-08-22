import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import { StatusScreen } from '@/components/bootstrap/StatusScreen';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <StatusScreen
      Icon={FileQuestion}
      tone="info"
      code="404"
      title="Page not found"
      description="The page you're looking for doesn't exist or may have moved."
      actions={[{ label: 'Go to dashboard', Icon: Home, onClick: () => navigate('/dashboard') }]}
    />
  );
}
