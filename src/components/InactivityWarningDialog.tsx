import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface InactivityWarningDialogProps {
  open: boolean;
  timeRemaining: number;
  onStayLoggedIn: () => void;
}

export const InactivityWarningDialog = ({
  open,
  timeRemaining,
  onStayLoggedIn,
}: InactivityWarningDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-xl">Session Expiring Soon</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            You will be automatically logged out in{' '}
            <span className="font-bold text-destructive text-lg">
              {timeRemaining} second{timeRemaining !== 1 ? 's' : ''}
            </span>
            {' '}due to inactivity.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end gap-3 mt-4">
          <Button
            onClick={onStayLoggedIn}
            className="w-full sm:w-auto"
            size="lg"
          >
            Stay Logged In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
