import type { PropsWithChildren } from 'react';
import { Loader } from '@/components/common/Loader';
import { useAuth } from '@/hooks/useAuth';
import { useInitializeAuth } from '@/features/auth/hooks/useInitializeAuth';

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const { isAuthInitialized } = useAuth();

  useInitializeAuth();

  if (!isAuthInitialized) {
    return <Loader />;
  }

  return children;
};
