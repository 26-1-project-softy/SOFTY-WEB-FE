import { Navigate, Outlet } from 'react-router-dom';
import { Loader } from '@/components/common/Loader';
import { useAuth } from '@/hooks/useAuth';
import type { AuthRole } from '@/stores/authStore';
import { ROUTES } from '@/constants/routes';

type ProtectedRouteProps = {
  allowedRoles?: Exclude<AuthRole, null>[];
};

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isAuthInitialized, role } = useAuth();

  if (!isAuthInitialized) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    const redirectTo =
      allowedRoles?.length === 1 && allowedRoles[0] === 'admin' ? ROUTES.adminLogin : ROUTES.root;

    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to={ROUTES.forbidden} replace />;
  }

  return <Outlet />;
};
