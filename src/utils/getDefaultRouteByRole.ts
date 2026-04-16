import type { AuthRole } from '@/stores/authStore';
import { ROUTES } from '@/constants/routes';

export const getDefaultRouteByRole = (role: AuthRole) => {
  if (role === 'admin') {
    return ROUTES.admin;
  } else if (role === 'teacher') {
    return ROUTES.inbox;
  } else return ROUTES.root;
};
