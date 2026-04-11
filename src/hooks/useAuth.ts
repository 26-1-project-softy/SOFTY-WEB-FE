import { useAuthStore } from '@/stores/authStore';

export const useAuth = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const role = useAuthStore(state => state.role);
  const user = useAuthStore(state => state.user);
  const isAuthInitialized = useAuthStore(state => state.isAuthInitialized);
  const setAuth = useAuthStore(state => state.setAuth);
  const setAuthInitialized = useAuthStore(state => state.setAuthInitialized);
  const clearAuth = useAuthStore(state => state.clearAuth);

  return {
    isAuthenticated,
    role,
    user,
    isAuthInitialized,
    setAuth,
    setAuthInitialized,
    clearAuth,
  };
};
