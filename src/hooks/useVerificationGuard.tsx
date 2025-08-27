import { useAuth } from '@/hooks/useAuth';

interface VerificationGuardResult {
  isVerified: boolean;
  canAccessFeatures: boolean;
  message: string;
}

export const useVerificationGuard = (): VerificationGuardResult => {
  const { user } = useAuth();

  if (!user) {
    return {
      isVerified: false,
      canAccessFeatures: false,
      message: 'You must be logged in to access this feature.'
    };
  }

  return {
    isVerified: true,
    canAccessFeatures: true,
    message: ''
  };
};