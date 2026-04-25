export type KakaoCallbackQuery = {
  code: string;
  error: string;
  errorDescription: string;
};

export const parseKakaoCallbackQuery = (search: string): KakaoCallbackQuery => {
  const searchParams = new URLSearchParams(search);

  return {
    code: searchParams.get('code') || '',
    error: searchParams.get('error') || '',
    errorDescription: searchParams.get('error_description') || '',
  };
};
