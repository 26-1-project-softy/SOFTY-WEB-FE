import styled from '@emotion/styled';
import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { IcKakao } from '@/icons';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRouteByRole } from '@/utils/getDefaultRouteByRole';
import { authApi } from '@/services/auth/authApi';
import { authSession } from '@/services/auth/authSession';
import { kakaoApi } from '@/services/auth/kakaoApi';
import { useToastStore } from '@/stores/toastStore';
import mockups1 from '@/images/mockups1.png';
import mockups2 from '@/images/mockups2.png';
import mockups3 from '@/images/mockups3.png';
import mockups4 from '@/images/mockups4.png';
import mockups5 from '@/images/mockups5.png';

const KAKAO_LOGIN_START_ERROR_MESSAGE = '카카오 로그인에 실패했어요.';
const DEV_LOGIN_ERROR_MESSAGE = '개발용 로그인에 실패했어요.';
const DEV_LOGIN_PROFILE_FETCH_ERROR_MESSAGE =
  '개발용 로그인은 성공했지만 사용자 정보 조회에 실패했어요.';
const DEV_LOGIN_SOCIAL_ID_MISSING_MESSAGE =
  '개발용 로그인 ID가 설정되지 않았어요. .env의 VITE_DEV_LOGIN_SOCIAL_ID를 확인해주세요.';

const getErrorMessageWithStatus = (error: unknown, fallbackMessage: string) => {
  const axiosError = error as AxiosError<{ message?: string }>;
  const message = axiosError.response?.data?.message || axiosError.message || fallbackMessage;
  const status = axiosError.response?.status;

  return status ? `${message} (HTTP ${status})` : message;
};

const getKakaoLoginStartUrl = () => {
  const restApiKey =
    (import.meta.env.VITE_KAKAO_REST_API_KEY as string | undefined) ||
    (import.meta.env.VITE_KAKAO_JS_KEY as string | undefined);
  const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI as string | undefined;

  if (restApiKey && redirectUri) {
    return `https://kauth.kakao.com/oauth/authorize?client_id=${restApiKey}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

  if (apiBaseUrl) {
    return `${apiBaseUrl}/oauth2/authorization/kakao`;
  }

  return '';
};

export const LandingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showToast = useToastStore(state => state.showToast);
  const { setAuth } = useAuth();
  const [isDevLoggingIn, setIsDevLoggingIn] = useState(false);
  const isDev = import.meta.env.DEV;
  const isDevAuthBypassEnabled = isDev && import.meta.env.VITE_ENABLE_DEV_AUTH_BYPASS === 'true';
  const devLoginSocialId = (import.meta.env.VITE_DEV_LOGIN_SOCIAL_ID as string | undefined)?.trim();

  const kakaoLoginError = searchParams.get('kakaoLoginError');
  const kakaoLoginUrl = useMemo(() => getKakaoLoginStartUrl(), []);

  useEffect(() => {
    if (!kakaoLoginError) {
      return;
    }

    showToast(kakaoLoginError, 'error');
    navigate(ROUTES.root, { replace: true });
  }, [kakaoLoginError, navigate, showToast]);

  const handleGoAdminLogin = () => {
    navigate(ROUTES.adminLogin);
  };

  const handleKakaoLogin = () => {
    if (!kakaoLoginUrl) {
      showToast(KAKAO_LOGIN_START_ERROR_MESSAGE, 'error');
      return;
    }

    window.location.href = kakaoLoginUrl;
  };

  const handleDevBypassLogin = async (role: 'teacher' | 'admin') => {
    if (isDevLoggingIn) {
      return;
    }

    if (!devLoginSocialId) {
      showToast(DEV_LOGIN_SOCIAL_ID_MISSING_MESSAGE, 'error');
      return;
    }

    try {
      setIsDevLoggingIn(true);
      let response;

      try {
        response = await kakaoApi.devLogin({
          socialId: devLoginSocialId,
          role,
          nickname: role === 'teacher' ? '개발용 교사' : '개발용 관리자',
        });
      } catch (error) {
        showToast(getErrorMessageWithStatus(error, DEV_LOGIN_ERROR_MESSAGE), 'error');
        return;
      }

      if (!response.success) {
        showToast(response.message || DEV_LOGIN_ERROR_MESSAGE, 'error');
        return;
      }

      authSession.setTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      });

      if (response.data.registrationRequired) {
        navigate(ROUTES.teacherSignUp, { replace: true });
        return;
      }

      let me;

      try {
        me = await authApi.getMe(response.data.accessToken);
      } catch (error) {
        showToast(getErrorMessageWithStatus(error, DEV_LOGIN_PROFILE_FETCH_ERROR_MESSAGE), 'error');
        return;
      }

      setAuth({
        isAuthenticated: true,
        role: me.role,
        user: me.user,
      });

      navigate(getDefaultRouteByRole(me.role), { replace: true });
    } finally {
      setIsDevLoggingIn(false);
    }
  };

  const handleScrollToFeature = () => {
    const target = document.getElementById('landing-feature-section');

    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Page>
      {isDev ? <DevMarker>LANDING_V2</DevMarker> : null}
      <Header>
        <Logo>소프티</Logo>
        <HeaderActions>
          {isDevAuthBypassEnabled ? (
            <DevQuickLoginWrap>
              <DevQuickLoginButton
                type="button"
                onClick={() => handleDevBypassLogin('teacher')}
                disabled={isDevLoggingIn}
              >
                {isDevLoggingIn ? '로그인 중...' : '교사 빠른 로그인'}
              </DevQuickLoginButton>
              <DevQuickLoginButton
                type="button"
                onClick={() => handleDevBypassLogin('admin')}
                disabled={isDevLoggingIn}
              >
                {isDevLoggingIn ? '로그인 중...' : '관리자 빠른 로그인'}
              </DevQuickLoginButton>
            </DevQuickLoginWrap>
          ) : null}
          <GhostButton type="button" onClick={handleGoAdminLogin}>
            관리자 로그인
          </GhostButton>
          <KakaoButton type="button" onClick={handleKakaoLogin}>
            <IcKakao />
            카카오로 로그인
          </KakaoButton>
        </HeaderActions>
      </Header>

      <HeroSection>
        <SectionInner>
          <HeroText>
            <HeroTitle>
              선생님과 학부모를 잇는
              <br />더 안전한 학급 소통 공간, <Highlight>소프티</Highlight>
            </HeroTitle>
            <HeroDescription>
              학부모와 비동기로 소통하고,
              <br />
              AI로 분쟁 위험을 점검하고,
              <br />
              대화 내역은 PDF로 저장해보세요.
              <br />
              소프티와 함께라면 안심하고 소통할 수 있어요.
            </HeroDescription>
            <HeroActions>
              <KakaoButton type="button" onClick={handleKakaoLogin}>
                <IcKakao />
                카카오로 로그인
              </KakaoButton>
              <GhostButton type="button" onClick={handleScrollToFeature}>
                서비스 둘러보기
              </GhostButton>
            </HeroActions>
          </HeroText>

          <HeroMockStage>
            <HeroImage src={mockups1} alt="메인 소개 목업" />
          </HeroMockStage>
        </SectionInner>
      </HeroSection>

      <FeatureSection id="landing-feature-section">
        <SectionInner twoColumn>
          <TextBlock>
            <SectionLabel>가입</SectionLabel>
            <SectionTitle>
              학급 생성부터 참여까지
              <br />
              간편하게
            </SectionTitle>
            <SectionDescription>
              교사는 학급을 개설하고,
              <br />
              학부모는 학급 코드를 입력해
              <br />
              간단한 절차로 소통을 시작할 수 있어요.
            </SectionDescription>
          </TextBlock>

          <JoinMockStage>
            <JoinCardMock src={mockups2} alt="학급 코드 생성 목업" />
            <PhoneMock src={mockups3} alt="학급 참여 모바일 목업" />
          </JoinMockStage>
        </SectionInner>
      </FeatureSection>

      <FeatureSection>
        <SectionInner twoColumn>
          <TextBlock>
            <SectionLabel>수신함·채팅방</SectionLabel>
            <SectionTitle>
              문의 의도 파악은 빠르게,
              <br />
              답장은 더 신중하게
            </SectionTitle>
            <SectionDescription>
              AI가 문의 의도 태그를 먼저 제안하고,
              <br />
              교사가 AI 검토를 받은 뒤 메시지를 전송해요.
            </SectionDescription>
          </TextBlock>

          <InboxMockStage>
            <InboxMockImage src={mockups5} alt="수신함 및 AI 분석 목업" />
          </InboxMockStage>
        </SectionInner>
      </FeatureSection>

      <FeatureSection>
        <SectionInner twoColumn>
          <TextBlock>
            <SectionLabel>증빙 리포트</SectionLabel>
            <SectionTitle>
              대화 내역,
              <br />
              간편하게 내려받을 수 있도록
            </SectionTitle>
            <SectionDescription>
              원하는 대화를 선택하고
              <br />
              미리보기로 확인한 뒤 PDF로 저장할 수 있어요.
            </SectionDescription>
          </TextBlock>

          <ReportMockStage>
            <ReportMockImage src={mockups4} alt="증빙 리포트 목업" />
          </ReportMockStage>
        </SectionInner>
      </FeatureSection>

      <CtaSection>
        <CtaTitle>
          학급 소통을 더 간편하고 안전하게
          <br />
          소프티에서 시작해보세요
        </CtaTitle>
        <CtaDescription>
          선생님과 학부모를 잇는 학급 소통,
          <br />
          이제 더 명확하고 편안하게 관리해보세요.
        </CtaDescription>
        <KakaoButton type="button" onClick={handleKakaoLogin}>
          <IcKakao />
          카카오로 로그인
        </KakaoButton>
      </CtaSection>

      <Footer>© 2026, 소프티 All rights reserved.</Footer>
    </Page>
  );
};

const Page = styled.div`
  min-height: 100vh;
  background: #f4f5f6;
`;

const DevMarker = styled.div`
  position: fixed;
  top: 8px;
  left: 8px;
  z-index: 99999;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  height: 84px;
  padding: 0 44px;
  border-bottom: 1px solid #d9dddf;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 760px) {
    height: 72px;
    padding: 0 16px;
  }
`;

const Logo = styled.h1`
  ${({ theme }) => theme.fonts.title3};
  margin: 0;
  color: ${({ theme }) => theme.colors.brand.primary};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const DevQuickLoginWrap = styled.div`
  display: flex;
  gap: 6px;
`;

const DevQuickLoginButton = styled.button`
  ${({ theme }) => theme.fonts.caption};
  border: 1px dashed #85aca7;
  border-radius: 10px;
  background: #e9f6f4;
  color: #2f625b;
  padding: 9px 10px;
`;

const GhostButton = styled.button`
  ${({ theme }) => theme.fonts.labelXS};
  border: 1px solid #d3d7da;
  border-radius: 12px;
  background: #f8f9fa;
  color: ${({ theme }) => theme.colors.text.text1};
  padding: 11px 14px;
`;

const KakaoButton = styled.button`
  ${({ theme }) => theme.fonts.labelXS};
  border: none;
  border-radius: 12px;
  background: #fee500;
  color: #191919;
  padding: 11px 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const HeroSection = styled.section`
  padding: 42px 24px 92px;
  background: linear-gradient(180deg, #f4f5f6 0%, #c9e8e4 58%, #6ccdc4 100%);
`;

const SectionInner = styled.div<{ twoColumn?: boolean }>`
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  display: ${({ twoColumn }) => (twoColumn ? 'grid' : 'block')};
  grid-template-columns: 1fr 1.2fr;
  gap: 28px;
  align-items: center;

  @media (max-width: 980px) {
    display: block;
  }
`;

const HeroText = styled.div`
  max-width: 560px;
`;

const HeroTitle = styled.h2`
  ${({ theme }) => theme.fonts.title1};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text1};

  @media (max-width: 760px) {
    ${({ theme }) => theme.fonts.title2};
  }
`;

const Highlight = styled.span`
  color: ${({ theme }) => theme.colors.brand.primary};
`;

const HeroDescription = styled.p`
  ${({ theme }) => theme.fonts.body1};
  margin: 20px 0 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const HeroActions = styled.div`
  margin-top: 24px;
  display: flex;
  gap: 12px;
`;

const HeroMockStage = styled.div`
  display: flex;
  margin-top: 44px;
  min-height: 260px;
`;

const HeroImage = styled.img`
  width: min(580px, 100%);
  max-width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 16px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
`;

const FeatureSection = styled.section`
  padding: 78px 24px;
  border-top: 1px solid #dde0e3;
  background: #f4f5f6;
`;

const TextBlock = styled.div``;

const SectionLabel = styled.p`
  ${({ theme }) => theme.fonts.labelXS};
  margin: 0;
  color: ${({ theme }) => theme.colors.brand.primary};
`;

const SectionTitle = styled.h3`
  ${({ theme }) => theme.fonts.title1};
  margin: 10px 0 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const SectionDescription = styled.p`
  ${({ theme }) => theme.fonts.body1};
  margin: 16px 0 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const JoinMockStage = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 16px;

  @media (max-width: 980px) {
    margin-top: 24px;
    justify-content: center;
  }

  @media (max-width: 760px) {
    flex-direction: column;
    align-items: center;
  }
`;

const JoinCardMock = styled.img`
  width: min(320px, 100%);
  max-width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 16px;
  box-shadow: 0 10px 16px rgba(0, 0, 0, 0.12);
`;

const PhoneMock = styled.img`
  width: min(220px, 100%);
  max-width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 24px;
  box-shadow: 0 12px 18px rgba(0, 0, 0, 0.15);
`;

const InboxMockStage = styled.div`
  display: flex;
  min-height: 420px;

  @media (max-width: 980px) {
    margin-top: 24px;
  }
`;

const InboxMockImage = styled.img`
  width: min(520px, 100%);
  max-width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 18px;
  box-shadow: 0 10px 16px rgba(0, 0, 0, 0.12);
`;

const ReportMockStage = styled.div`
  display: flex;
  min-height: 320px;

  @media (max-width: 980px) {
    margin-top: 24px;
  }
`;

const ReportMockImage = styled.img`
  width: min(520px, 100%);
  max-width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 14px;
  box-shadow: 0 8px 14px rgba(0, 0, 0, 0.08);
`;

const CtaSection = styled.section`
  padding: 84px 24px 72px;
  border-top: 1px solid #dde0e3;
  background: #f4f5f6;
  text-align: center;
`;

const CtaTitle = styled.h3`
  ${({ theme }) => theme.fonts.title1};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const CtaDescription = styled.p`
  ${({ theme }) => theme.fonts.body1};
  margin: 18px 0 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const Footer = styled.footer`
  ${({ theme }) => theme.fonts.body3};
  text-align: center;
  padding: 18px 16px 28px;
  color: #919191;
`;
