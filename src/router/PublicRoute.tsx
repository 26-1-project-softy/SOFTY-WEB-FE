import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRouteByActiveRole } from '@/utils/getDefaultRouteByActiveRole';
import { ROUTES } from '@/constants/routes';

export const PublicRoute = () => {
  const { authStatus, activeRole } = useAuth();
  const location = useLocation();

  if (authStatus === 'SIGNUP_REQUIRED') {
    if (location.pathname === ROUTES.teacherSignUp) {
      return <Outlet />;
    }

    return <Navigate to={ROUTES.teacherSignUp} replace />;
  }

  if (authStatus === 'SIGNED_IN' && activeRole) {
    return <Navigate to={getDefaultRouteByActiveRole(activeRole)} replace />;
  }

  return <Outlet />;
};
