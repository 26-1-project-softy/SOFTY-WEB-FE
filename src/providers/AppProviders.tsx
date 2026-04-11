import type { PropsWithChildren } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { Toast } from '@/components/common/Toast';

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toast />
      </AuthProvider>
    </QueryProvider>
  );
};
