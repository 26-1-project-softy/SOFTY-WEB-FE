import { create } from 'zustand';

export type AuthRole = 'teacher' | 'admin' | null;

export type AuthUserSummary = {
  name: string;
  grade?: number;
  classNumber?: number;
};

type AuthState = {
  isAuthenticated: boolean;
  role: AuthRole;
  user: AuthUserSummary | null;
  isAuthInitialized: boolean;
  setAuth: (payload: {
    isAuthenticated: boolean;
    role: AuthRole;
    user: AuthUserSummary | null;
  }) => void;
  setAuthInitialized: (isAuthInitialized: boolean) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>(set => ({
  isAuthenticated: false,
  role: null,
  user: null,
  isAuthInitialized: false,

  setAuth: ({ isAuthenticated, role, user }) =>
    set({
      isAuthenticated,
      role,
      user,
    }),

  setAuthInitialized: isAuthInitialized =>
    set({
      isAuthInitialized,
    }),

  clearAuth: () =>
    set({
      isAuthenticated: false,
      role: null,
      user: null,
    }),
}));
