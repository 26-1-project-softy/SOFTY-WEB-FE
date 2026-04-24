import { STORAGE_KEYS } from '@/constants/storageKeys';

export type StoredAuthStatus = 'SIGNED_OUT' | 'SIGNUP_REQUIRED' | 'SIGNED_IN';

const isStoredAuthStatus = (value: string | null): value is StoredAuthStatus => {
  return value === 'SIGNED_OUT' || value === 'SIGNUP_REQUIRED' || value === 'SIGNED_IN';
};

export const authSession = {
  getAccessToken: () => localStorage.getItem(STORAGE_KEYS.accessToken),

  getRefreshToken: () => localStorage.getItem(STORAGE_KEYS.refreshToken),

  setTokens: (tokens: { accessToken: string; refreshToken: string }) => {
    localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
  },

  getAuthStatus: (): StoredAuthStatus => {
    const storedAuthStatus = localStorage.getItem(STORAGE_KEYS.authStatus);

    if (isStoredAuthStatus(storedAuthStatus)) {
      return storedAuthStatus;
    }

    return 'SIGNED_OUT';
  },

  setAuthStatus: (authStatus: StoredAuthStatus) => {
    localStorage.setItem(STORAGE_KEYS.authStatus, authStatus);
  },

  clearSession: () => {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.authStatus);
  },
};
