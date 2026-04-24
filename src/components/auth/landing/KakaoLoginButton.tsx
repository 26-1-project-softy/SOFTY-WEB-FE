import { useTheme } from '@emotion/react';
import { useTeacherKakaoLogin } from '@/features/auth/hooks/useTeacherKakaoLogin';
import { InlineButton } from '@/components/common/InlineButton';
import { IcKakao } from '@/icons';

export const KakaoLoginButton = () => {
  const theme = useTheme();
  const { isKakaoLoginLoading, handleKakaoLogin } = useTeacherKakaoLogin();

  return (
    <InlineButton
      variant="primary"
      size="L"
      icon={IcKakao}
      label="카카오로 교사 로그인"
      bgColor={theme.colors.kakao.primary}
      activeBgColor={theme.colors.kakao.active}
      color={theme.colors.text.text1}
      onClick={handleKakaoLogin}
      disabled={isKakaoLoginLoading}
    />
  );
};
