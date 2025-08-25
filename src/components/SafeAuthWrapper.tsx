import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface SafeAuthWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const SafeAuthWrapper = ({ children, fallback = null }: SafeAuthWrapperProps) => {
  try {
    // Try to access the auth context
    useAuth();
    return <>{children}</>;
  } catch (error) {
    // If auth context is not available, render fallback
    console.warn('Auth context not available, rendering fallback');
    return <>{fallback}</>;
  }
};