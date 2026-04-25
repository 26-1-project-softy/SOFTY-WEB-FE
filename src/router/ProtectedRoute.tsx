import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { AuthRole } from '@/stores/authStore';
import { ROUTES } from '@/constants/routes';

type ProtectedRouteProps = {
  allowedRoles?: Exclude<AuthRole, null>[];
};

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { authStatus, role } = useAuth();

  if (authStatus === 'SIGNED_OUT') {
    const redirectTo =
      allowedRoles?.length === 1 && allowedRoles[0] === 'admin' ? ROUTES.adminLogin : ROUTES.root;

    return <Navigate to={redirectTo} replace />;
  }

  if (authStatus === 'SIGNUP_REQUIRED') {
    return <Navigate to={ROUTES.teacherSignUp} replace />;
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to={ROUTES.forbidden} replace />;
  }

  return <Outlet />;
};
