import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

interface EmailVerificationStatusProps {
  showIcon?: boolean;
  className?: string;
}

export const EmailVerificationStatus = ({ 
  showIcon = true, 
  className = '' 
}: EmailVerificationStatusProps) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'verified' | 'pending' | 'unknown'>('unknown');

  useEffect(() => {
    if (!user) {
      setStatus('unknown');
      return;
    }

    if (user.email_confirmed_at) {
      setStatus('verified');
    } else {
      setStatus('pending');
    }
  }, [user]);

  if (!user || status === 'unknown') {
    return null;
  }

  const getStatusDisplay = () => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircle,
          text: 'Email Verified',
          variant: 'default' as const,
          className: 'bg-success/10 text-success border-success/20'
        };
      case 'pending':
        return {
          icon: AlertCircle,
          text: 'Email Pending',
          variant: 'secondary' as const,
          className: 'bg-warning/10 text-warning border-warning/20'
        };
      default:
        return {
          icon: Clock,
          text: 'Unknown Status',
          variant: 'outline' as const,
          className: 'bg-muted/10 text-muted-foreground border-muted/20'
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const Icon = statusDisplay.icon;

  return (
    <Badge 
      variant={statusDisplay.variant}
      className={`${statusDisplay.className} ${className} flex items-center gap-1`}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      <span className="text-xs font-medium">{statusDisplay.text}</span>
    </Badge>
  );
};