import type { AuthActiveRole } from '@/stores/authStore';
import { ROUTES } from '@/constants/routes';

export const getDefaultRouteByActiveRole = (activeRole: AuthActiveRole) => {
  if (activeRole === 'admin') {
    return ROUTES.adminDashboard;
  }

  if (activeRole === 'teacher') {
    return ROUTES.teacherThreadList;
  }

  return ROUTES.root;
};
