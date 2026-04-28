const KAKAO_AUTH_BASE_URL = 'https://kauth.kakao.com/oauth';

export const getKakaoLoginStartUrl = () => {
  const customAuthUrl = import.meta.env.VITE_KAKAO_AUTH_URL as string | undefined;

  if (customAuthUrl) {
    return customAuthUrl;
  }

  const restApiKey = import.meta.env.VITE_KAKAO_REST_API_KEY as string | undefined;
  const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI as string | undefined;

  if (!restApiKey || !redirectUri) {
    return '';
  }

  return `https://kauth.kakao.com/oauth/authorize?client_id=${restApiKey}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code`;
};

export const getKakaoLogoutUrl = () => {
  const restApiKey = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const logoutRedirectUri = import.meta.env.VITE_KAKAO_LOGOUT_REDIRECT_URI;

  if (!restApiKey || !logoutRedirectUri) {
    return '';
  }

  const searchParams = new URLSearchParams({
    client_id: restApiKey,
    logout_redirect_uri: logoutRedirectUri,
  });

  return `${KAKAO_AUTH_BASE_URL}/logout?${searchParams.toString()}`;
};
