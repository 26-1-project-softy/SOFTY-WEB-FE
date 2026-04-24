import { useEffect, type PropsWithChildren } from 'react';
import { Loader } from '@/components/common/Loader';
import { useAuthStore } from '@/stores/authStore';

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const isAuthInitialized = useAuthStore(state => state.isAuthInitialized);
  const setAuthInitialized = useAuthStore(state => state.setAuthInitialized);

  useEffect(() => {
    // TODO: 로그인/현재 사용자 조회 로직은 인증 연동 단계에서 연결
    setAuthInitialized(true);
  }, [setAuthInitialized]);

  if (!isAuthInitialized) {
    return <Loader />;
  }

  return children;
};
