const KAKAO_AUTH_BASE_URL = 'https://kauth.kakao.com/oauth';

const getEnvValue = (value: unknown) => {
  return typeof value === 'string' ? value.trim() : '';
};

export const getKakaoLoginStartUrl = () => {
  const restApiKey = getEnvValue(import.meta.env.VITE_KAKAO_REST_API_KEY);
  const redirectUri = getEnvValue(import.meta.env.VITE_KAKAO_REDIRECT_URI);

  if (!restApiKey || !redirectUri) {
    return '';
  }

  const searchParams = new URLSearchParams({
    client_id: restApiKey,
    redirect_uri: redirectUri,
    response_type: 'code',
  });

  return `${KAKAO_AUTH_BASE_URL}/authorize?${searchParams.toString()}`;
};

export const getKakaoLogoutUrl = () => {
  const restApiKey = getEnvValue(import.meta.env.VITE_KAKAO_REST_API_KEY);
  const logoutRedirectUri = getEnvValue(import.meta.env.VITE_KAKAO_LOGOUT_REDIRECT_URI);

  if (!restApiKey || !logoutRedirectUri) {
    return '';
  }

  const searchParams = new URLSearchParams({
    client_id: restApiKey,
    logout_redirect_uri: logoutRedirectUri,
  });

  return `${KAKAO_AUTH_BASE_URL}/logout?${searchParams.toString()}`;
};
