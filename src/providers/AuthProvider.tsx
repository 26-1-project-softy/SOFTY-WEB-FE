import { useEffect, type PropsWithChildren } from 'react';
import { Loader } from '@/components/common/Loader';
import { useAuthStore } from '@/stores/authStore';
import { applyDevLogin } from '@/services/auth/devAuth';

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const isAuthInitialized = useAuthStore(state => state.isAuthInitialized);
  const setAuth = useAuthStore(state => state.setAuth);
  const setAuthInitialized = useAuthStore(state => state.setAuthInitialized);

  useEffect(() => {
    const didApplyDevLogin = applyDevLogin({ setAuth, setAuthInitialized });

    if (didApplyDevLogin) {
      return;
    }

    // TODO: 로그인/로그아웃/현재 사용자 조회 로직은 인증 구현 단계에서 연결
    // auth 초기화 완료 처리
    setAuthInitialized(true);
  }, [setAuth, setAuthInitialized]);

  if (!isAuthInitialized) {
    return <Loader />;
  }

  return children;
};
