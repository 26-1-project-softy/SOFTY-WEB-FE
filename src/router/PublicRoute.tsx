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

  if (isAuthenticated && role) {
    return <Navigate to={getDefaultRouteByRole(role)} replace />;
  }

  if (isAuthenticated && !role) {
    return <Navigate to={ROUTES.root} replace />;
  }

  return <Outlet />;
};
