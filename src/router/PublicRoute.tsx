import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRouteByRole } from '@/utils/getDefaultRouteByRole';
import { ROUTES } from '@/constants/routes';

export const PublicRoute = () => {
  const { authStatus, role } = useAuth();
  const location = useLocation();

  if (authStatus === 'SIGNUP_REQUIRED') {
    if (location.pathname === ROUTES.teacherSignUp) {
      return <Outlet />;
    }

    return <Navigate to={ROUTES.teacherSignUp} replace />;
  }

  if (authStatus === 'SIGNED_IN' && role) {
    if (location.pathname === ROUTES.teacherSignUp) {
      return <Outlet />;
    }

    return <Navigate to={getDefaultRouteByRole(role)} replace />;
  }

  return <Outlet />;
};
