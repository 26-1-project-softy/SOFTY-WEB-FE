import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/stores/authStore';

export const useAuth = () => {
  return useAuthStore(
    useShallow(state => ({
      authStatus: state.authStatus,
      role: state.role,
      user: state.user,
      isAuthInitialized: state.isAuthInitialized,
      setSignedOut: state.setSignedOut,
      setSignupRequired: state.setSignupRequired,
      setSignedIn: state.setSignedIn,
      setAuthInitialized: state.setAuthInitialized,
      isAuthenticated: state.authStatus !== 'SIGNED_OUT',
    }))
  );
};
