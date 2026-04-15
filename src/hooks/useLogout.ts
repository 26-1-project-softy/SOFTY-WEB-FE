import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { authSession } from '@/services/auth/authSession';

type LogoutOptions = {
  redirectTo?: string;
  replace?: boolean;
};

export const useLogout = () => {
  const navigate = useNavigate();
  const { clearAuth } = useAuth();

  const logout = (options?: LogoutOptions) => {
    const { redirectTo = ROUTES.root, replace = true } = options ?? {};

    authSession.clearTokens();
    clearAuth();
    navigate(redirectTo, { replace });
  };

  return { logout };
};
