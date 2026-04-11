import { Navigate, Outlet } from 'react-router-dom';
import { Loader } from '@/components/common/Loader';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRouteByRole } from '@/utils/getDefaultRouteByRole';
import { ROUTES } from '@/constants/routes';

export const PublicRoute = () => {
  const { isAuthenticated, isAuthInitialized, role } = useAuth();

  if (!isAuthInitialized) {
    return <Loader />;
  }

  // TODO: 인증 구현 후 role 복원 시점까지 포함해 리다이렉트 동작 최종 검증
  if (isAuthenticated && role) {
    return <Navigate to={getDefaultRouteByRole(role)} replace />;
  }

  if (isAuthenticated && !role) {
    return <Navigate to={ROUTES.root} replace />;
  }

  return <Outlet />;
};
