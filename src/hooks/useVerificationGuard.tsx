import { useAuth } from '@/hooks/useAuth';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';

interface VerificationGuardResult {
  isVerified: boolean;
  canAccessFeatures: boolean;
  message: string;
}

export const useVerificationGuard = (): VerificationGuardResult => {
  const { user } = useAuth();
  const { status: verificationStatus, loading } = useVerificationStatus();

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

  // User is verified if their status is 'approved' or 'verified'
  const isVerified = verificationStatus === 'approved' || verificationStatus === 'verified';

  if (!isVerified) {
    let message = 'Your account must be verified to access this feature.';
    if (verificationStatus === 'pending') {
      message = 'Your verification is pending approval. Please wait for admin confirmation.';
    } else if (verificationStatus === 'rejected') {
      message = 'Your verification was rejected. Please resubmit your documents.';
    } else if (!verificationStatus) {
      message = 'Please submit your documents for verification to access this feature.';
    }

    return {
      isVerified: false,
      canAccessFeatures: false,
      message
    };
  }

  return {
    isVerified: true,
    canAccessFeatures: true,
    message: ''
  };
};