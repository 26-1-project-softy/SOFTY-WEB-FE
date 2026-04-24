import { useAuthStore } from '@/stores/authStore';

export const useAuth = () => {
  const authStatus = useAuthStore(state => state.authStatus);
  const role = useAuthStore(state => state.role);
  const user = useAuthStore(state => state.user);
  const isAuthInitialized = useAuthStore(state => state.isAuthInitialized);
  const setSignedOut = useAuthStore(state => state.setSignedOut);
  const setSignupRequired = useAuthStore(state => state.setSignupRequired);
  const setSignedIn = useAuthStore(state => state.setSignedIn);
  const setAuthInitialized = useAuthStore(state => state.setAuthInitialized);

  return {
    authStatus,
    role,
    user,
    isAuthInitialized,
    setSignedOut,
    setSignupRequired,
    setSignedIn,
    setAuthInitialized,
    isAuthenticated: authStatus !== 'SIGNED_OUT',
  };
};
