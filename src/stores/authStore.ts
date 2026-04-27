import { create } from 'zustand';

export type AuthRole = 'teacher' | 'admin' | null;
export type AuthStatus = 'SIGNED_OUT' | 'SIGNUP_REQUIRED' | 'ONBOARDING_REQUIRED' | 'SIGNED_IN';

export type AuthUserSummary = {
  name: string;
  grade?: number;
  classNumber?: number;
};

type AuthState = {
  authStatus: AuthStatus;
  role: AuthRole;
  user: AuthUserSummary | null;
  isAuthInitialized: boolean;
  setSignedOut: () => void;
  setSignupRequired: () => void;
  setOnboardingRequired: (payload: {
    role: Exclude<AuthRole, null>;
    user: AuthUserSummary | null;
  }) => void;
  setSignedIn: (payload: { role: Exclude<AuthRole, null>; user: AuthUserSummary }) => void;
  setAuthInitialized: (isAuthInitialized: boolean) => void;
};

export const useAuthStore = create<AuthState>(set => ({
  authStatus: 'SIGNED_OUT',
  role: null,
  user: null,
  isAuthInitialized: false,

  setSignedOut: () =>
    set({
      authStatus: 'SIGNED_OUT',
      role: null,
      user: null,
    }),

  setSignupRequired: () =>
    set({
      authStatus: 'SIGNUP_REQUIRED',
      role: null,
      user: null,
    }),

  setOnboardingRequired: ({ role, user }) =>
    set({
      authStatus: 'ONBOARDING_REQUIRED',
      role,
      user,
    }),

  setSignedIn: ({ role, user }) =>
    set({
      authStatus: 'SIGNED_IN',
      role,
      user,
    }),

  setAuthInitialized: isAuthInitialized =>
    set({
      isAuthInitialized,
    }),
}));
