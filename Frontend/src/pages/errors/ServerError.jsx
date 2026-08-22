import { useNavigate } from 'react-router-dom';
import { ServerCrash, RotateCcw, Home } from 'lucide-react';
import { StatusScreen } from '@/components/bootstrap/StatusScreen';

export default function ServerError({ onRetry }) {
  const navigate = useNavigate();
  return (
    <StatusScreen
      Icon={ServerCrash}
      tone="error"
      code="500"
      title="Something went wrong"
      description="An unexpected error occurred on our side. Please try again in a moment."
      actions={[
        { label: 'Try again', Icon: RotateCcw, onClick: onRetry || (() => window.location.reload()) },
        { label: 'Go home', Icon: Home, variant: 'secondary', onClick: () => navigate('/dashboard') },
      ]}
    />
  );
}
