import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';

interface VerificationStatusBadgeProps {
  status: 'pending' | 'approved' | 'verified' | 'rejected' | null;
  showIcon?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VerificationStatusBadge = ({ 
  status, 
  showIcon = true, 
  className = '',
  size = 'md'
}: VerificationStatusBadgeProps) => {
  if (!status) {
    return (
      <Badge 
        variant="outline"
        className={`flex items-center gap-1 bg-muted/10 text-muted-foreground border-muted/20 transition-all duration-200 hover:bg-muted/20 ${className}`}
        style={{
          // Cross-browser compatibility fallbacks
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        {showIcon && <AlertCircle className="h-3 w-3 flex-shrink-0" />}
        <span className={`font-medium whitespace-nowrap ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs'}`}>
          Not Submitted
        </span>
      </Badge>
    );
  }

  const getStatusDisplay = () => {
    switch (status) {
      case 'verified':
      case 'approved':
        return {
          icon: CheckCircle,
          text: 'Verification Approved',
          className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
          variant: 'default' as const
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'Verification Pending',
          className: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
          variant: 'secondary' as const
        };
      case 'rejected':
        return {
          icon: XCircle,
          text: 'Verification Rejected',
          className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
          variant: 'destructive' as const
        };
      default:
        return {
          icon: AlertCircle,
          text: 'Unknown Status',
          className: 'bg-muted/10 text-muted-foreground border-muted/20',
          variant: 'outline' as const
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const Icon = statusDisplay.icon;

  return (
    <Badge 
      variant={statusDisplay.variant}
      className={`flex items-center gap-1 transition-all duration-200 hover:shadow-sm ${statusDisplay.className} ${className}`}
      style={{
        // Enhanced cross-browser support
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden'
      }}
    >
      {showIcon && <Icon className={`flex-shrink-0 ${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'}`} />}
      <span className={`font-medium whitespace-nowrap ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs'}`}>
        {statusDisplay.text}
      </span>
    </Badge>
  );
};