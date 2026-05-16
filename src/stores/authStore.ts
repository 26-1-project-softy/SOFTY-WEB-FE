import { create } from 'zustand';

export type AuthActiveRole = 'teacher' | 'admin' | null;
export type AuthStatus = 'SIGNED_OUT' | 'SIGNUP_REQUIRED' | 'SIGNED_IN';

export type AuthUserSummary = {
  name: string;
  grade?: number;
  classNumber?: number;
};

type AuthState = {
  authStatus: AuthStatus;
  activeRole: AuthActiveRole;
  user: AuthUserSummary | null;
  isAuthInitialized: boolean;
  setSignedOut: () => void;
  setSignupRequired: () => void;
  setSignedIn: (payload: {
    activeRole: Exclude<AuthActiveRole, null>;
    user: AuthUserSummary;
  }) => void;
  setAuthInitialized: (isAuthInitialized: boolean) => void;
};

export const useAuthStore = create<AuthState>(set => ({
  authStatus: 'SIGNED_OUT',
  activeRole: null,
  user: null,
  isAuthInitialized: false,

  setSignedOut: () =>
    set({
      authStatus: 'SIGNED_OUT',
      activeRole: null,
      user: null,
    }),

  setSignupRequired: () =>
    set({
      authStatus: 'SIGNUP_REQUIRED',
      activeRole: null,
      user: null,
    }),

  setSignedIn: ({ activeRole, user }) =>
    set({
      authStatus: 'SIGNED_IN',
      activeRole,
      user,
    }),

  setAuthInitialized: isAuthInitialized =>
    set({
      isAuthInitialized,
    }),
}));
