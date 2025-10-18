import { useAuth } from '@/hooks/useAuth';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';

interface VerificationGuardResult {
  isVerified: boolean;
  canAccessFeatures: boolean;
  message: string;
  status: 'pending' | 'approved' | 'verified' | 'rejected' | null;
}

export const useVerificationGuard = (): VerificationGuardResult => {
  const { user } = useAuth();
  const { status, loading } = useVerificationStatus();

  if (!user) {
    return {
      isVerified: false,
      canAccessFeatures: false,
      message: 'You must be logged in to access this feature.',
      status: null
    };
  }

  if (loading) {
    return {
      isVerified: false,
      canAccessFeatures: false,
      message: 'Checking verification status...',
      status: null
    };
  }

  if (!status) {
    return {
      isVerified: false,
      canAccessFeatures: false,
      message: 'Please submit your ID verification documents to book parking spaces or list your property.',
      status: null
    };
  }

  if (status === 'pending') {
    return {
      isVerified: false,
      canAccessFeatures: false,
      message: 'Your verification is under review. Please wait for admin approval.',
      status: 'pending'
    };
  }

  if (status === 'rejected') {
    return {
      isVerified: false,
      canAccessFeatures: false,
      message: 'Your verification was rejected. Please resubmit your documents with the correct information.',
      status: 'rejected'
    };
  }

  // Only 'approved' or 'verified' status can access features
  return {
    isVerified: true,
    canAccessFeatures: true,
    message: '',
    status
  };
};