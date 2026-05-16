import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { AuthActiveRole } from '@/stores/authStore';
import { ROUTES } from '@/constants/routes';

type ProtectedRouteProps = {
  allowedActiveRoles?: Exclude<AuthActiveRole, null>[];
};

export const ProtectedRoute = ({ allowedActiveRoles }: ProtectedRouteProps) => {
  const { authStatus, activeRole } = useAuth();

  if (authStatus === 'SIGNED_OUT') {
    const redirectTo =
      allowedActiveRoles?.length === 1 && allowedActiveRoles[0] === 'admin'
        ? ROUTES.adminLogin
        : ROUTES.root;

    return <Navigate to={redirectTo} replace />;
  }

  if (authStatus === 'SIGNUP_REQUIRED') {
    return <Navigate to={ROUTES.teacherSignUp} replace />;
  }

  if (allowedActiveRoles && (!activeRole || !allowedActiveRoles.includes(activeRole))) {
    return <Navigate to={ROUTES.forbidden} replace />;
  }

  return <Outlet />;
};
