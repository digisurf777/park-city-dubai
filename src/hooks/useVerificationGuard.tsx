import { useAuth } from '@/hooks/useAuth';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';

interface VerificationGuardResult {
  isVerified: boolean;
  canAccessFeatures: boolean;
  message: string;
}

export const useVerificationGuard = (): VerificationGuardResult => {
  const { user } = useAuth();
  const { status, loading } = useVerificationStatus();

  if (!user) {
    return {
      isVerified: false,
      canAccessFeatures: false,
      message: 'You must be logged in to access this feature.'
    };
  }

  if (loading) {
    return {
      isVerified: false,
      canAccessFeatures: false,
      message: 'Checking verification status...'
    };
  }

  if (status !== 'approved') {
    return {
      isVerified: false,
      canAccessFeatures: false,
      message: 'Your account must be verified to list or book parking spaces. Please complete the verification process in your account settings.'
    };
  }

  return {
    isVerified: true,
    canAccessFeatures: true,
    message: ''
  };
};