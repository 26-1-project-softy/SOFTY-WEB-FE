import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { authSession } from '@/services/auth/authSession';
import { getKakaoLogoutUrl } from '@/features/auth/lib/getKakaoUrl';

type LogoutOptions = {
  redirectTo?: string;
  replace?: boolean;
};

export const useLogout = () => {
  const navigate = useNavigate();
  const { setSignedOut } = useAuth();

  const logout = (options?: LogoutOptions) => {
    const { redirectTo = ROUTES.root, replace = true } = options ?? {};

    authSession.clearSession();
    setSignedOut();

    const kakaoLogoutUrl = getKakaoLogoutUrl();

    if (kakaoLogoutUrl) {
      window.location.href = kakaoLogoutUrl;
      return;
    }

    navigate(redirectTo, { replace });
  };

  return { logout };
};
