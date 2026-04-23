import type { PropsWithChildren } from 'react';
import { Toast } from '@/components/common/Toast';
import { AuthProvider } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <QueryProvider>
      <Toast />
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
};
