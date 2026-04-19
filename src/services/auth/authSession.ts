import { STORAGE_KEYS } from '@/constants/storageKeys';

export const authSession = {
  getAccessToken: () => localStorage.getItem(STORAGE_KEYS.accessToken),

  setTokens: (tokens: { accessToken: string; refreshToken: string }) => {
    localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
  },

  clearSession: () => {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
  },
};
