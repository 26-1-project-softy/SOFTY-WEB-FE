import { STORAGE_KEYS } from '@/constants/storageKeys';

export type SessionAuthStatus = 'SIGNED_OUT' | 'SIGNUP_REQUIRED' | 'SIGNED_IN';

export const authSession = {
  getAccessToken: () => localStorage.getItem(STORAGE_KEYS.accessToken),
  getAuthStatus: () => localStorage.getItem(STORAGE_KEYS.authStatus) as SessionAuthStatus | null,

  setTokens: (tokens: { accessToken: string; refreshToken: string }) => {
    localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
  },

  setAuthStatus: (status: SessionAuthStatus) => {
    localStorage.setItem(STORAGE_KEYS.authStatus, status);
  },

  clearSession: () => {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.authStatus);
  },
};
