import { STORAGE_KEYS } from '@/constants/storageKeys';

export type StoredAuthStatus =
  | 'SIGNED_OUT'
  | 'SIGNUP_REQUIRED'
  | 'ONBOARDING_REQUIRED'
  | 'SIGNED_IN';

const AUTH_STATUS_KEY = `${STORAGE_KEYS.accessToken}_status`;

export const authSession = {
  getAccessToken: () => localStorage.getItem(STORAGE_KEYS.accessToken),

  getRefreshToken: () => localStorage.getItem(STORAGE_KEYS.refreshToken),

  setTokens: (tokens: { accessToken: string; refreshToken: string }) => {
    localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
  },

  getAuthStatus: (): StoredAuthStatus => {
    const storedAuthStatus = localStorage.getItem(AUTH_STATUS_KEY);

    if (
      storedAuthStatus === 'SIGNED_OUT' ||
      storedAuthStatus === 'SIGNUP_REQUIRED' ||
      storedAuthStatus === 'ONBOARDING_REQUIRED' ||
      storedAuthStatus === 'SIGNED_IN'
    ) {
      return storedAuthStatus;
    }

    return 'SIGNED_OUT';
  },

  setAuthStatus: (authStatus: StoredAuthStatus) => {
    localStorage.setItem(AUTH_STATUS_KEY, authStatus);
  },

  clearSession: () => {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(AUTH_STATUS_KEY);
  },
};
