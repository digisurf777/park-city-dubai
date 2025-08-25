import { useState, useEffect } from 'react';
import { AlertCircle, X, Mail, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const EmailConfirmationBanner = () => {
  const { user, resendConfirmationEmail } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [lastResendTime, setLastResendTime] = useState<number | null>(null);

  // Check if user needs email confirmation
  useEffect(() => {
    if (user && !user.email_confirmed_at) {
      setIsVisible(true);
      
      // Check if we have a stored resend time
      const storedTime = localStorage.getItem(`last_resend_${user.email}`);
      if (storedTime) {
        const timeDiff = Date.now() - parseInt(storedTime);
        const remainingTime = Math.max(0, 60000 - timeDiff); // 1 minute cooldown
        
        if (remainingTime > 0) {
          setCountdown(Math.ceil(remainingTime / 1000));
          setLastResendTime(parseInt(storedTime));
        }
      }
    } else {
      setIsVisible(false);
    }
  }, [user]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!user?.email || countdown > 0) return;

    setIsResending(true);
    try {
      const { error } = await resendConfirmationEmail(user.email);
      
      if (error) {
        if (error.message?.includes('Rate limit')) {
          toast.error('Too many requests. Please wait before trying again.');
        } else if (error.message?.includes('Invalid email')) {
          toast.error('Invalid email address. Please contact support.');
        } else {
          toast.error('Failed to resend confirmation email. Please try again later.');
        }
        return;
      }

      // Success
      toast.success('Confirmation email sent! Check your inbox and spam folder.');
      
      // Set cooldown
      const now = Date.now();
      setLastResendTime(now);
      setCountdown(60); // 1 minute cooldown
      localStorage.setItem(`last_resend_${user.email}`, now.toString());
      
    } catch (error) {
      console.error('Resend email error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember dismissal for this session
    sessionStorage.setItem(`dismissed_banner_${user?.email}`, 'true');
  };

  // Don't show if user dismissed it this session
  if (user?.email && sessionStorage.getItem(`dismissed_banner_${user.email}`)) {
    return null;
  }

  if (!isVisible || !user) {
    return null;
  }

  return (
    <Alert className="mb-4 border-warning/20 bg-warning/5">
      <AlertCircle className="h-4 w-4 text-warning" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-4 w-4 text-warning" />
            <span className="font-medium text-warning">Email Confirmation Required</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            We sent a confirmation email to <strong>{user.email}</strong>. Please check your inbox and spam folder, then click the confirmation link to activate your account.
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendEmail}
              disabled={isResending || countdown > 0}
              className="h-8"
            >
              {isResending ? (
                <>
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                <>
                  <Clock className="h-3 w-3 mr-2" />
                  Resend in {countdown}s
                </>
              ) : (
                <>
                  <Mail className="h-3 w-3 mr-2" />
                  Resend Email
                </>
              )}
            </Button>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3" />
              <span>Confirmation emails are sent in English and Arabic</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
};