import type { AuthRole } from '@/stores/authStore';
import { ROUTES } from '@/constants/routes';

export const getDefaultRouteByRole = (role: AuthRole) => {
  if (role === 'admin') {
    return ROUTES.adminDashboard;
  }

  if (role === 'teacher') {
    return ROUTES.inbox;
  }

  return ROUTES.root;
};
