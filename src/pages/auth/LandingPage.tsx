import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/common/Header';
import { InlineButton } from '@/components/common/InlineButton';
import {
  KakaoLoginButton,
  LandingHeroSection,
  LandingSignupSection,
  LandingAiAnalysisSection,
  LandingReportSection,
  LandingCtaSection,
  ParentAppInstallDialog,
} from '@/components/auth/landing';
import { EXTERNAL_LINKS, landingContent } from '@/constants/landing';
import { ROUTES } from '@/constants/routes';
import { FooterCopyright } from '@/components/common/FooterCopyright';

const LANDING_FEATURE_SECTION_ID = 'landing-feature-section';

export const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isParentAppInstallDialogOpen, setIsParentAppInstallDialogOpen] = useState(false);

  const handleGoAdminLogin = () => {
    navigate(ROUTES.adminLogin);
  };

  const handleScrollToFeature = () => {
    const target = document.getElementById(LANDING_FEATURE_SECTION_ID);

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleOpenParentAppInstallDialog = () => {
    setIsParentAppInstallDialogOpen(true);
  };

  const handleCloseParentAppInstallDialog = () => {
    setIsParentAppInstallDialogOpen(false);
  };

  const handleOpenDistributionPage = () => {
    const openedWindow = window.open(
      EXTERNAL_LINKS.parentAppDistribution,
      '_blank',
      'noopener,noreferrer'
    );

    if (!openedWindow) {
      window.location.href = EXTERNAL_LINKS.parentAppDistribution;
    }
  };

  return (
    <LandingPageContainer>
      <Header
        title="SOFTY"
        hasLogo
        titleColor={theme.colors.brand.primary}
        actions={
          <HeaderActionContainer>
            <InlineButton
              variant="ghost"
              size="L"
              label="관리자 로그인"
              onClick={handleGoAdminLogin}
            />
            <KakaoLoginButton />
          </HeaderActionContainer>
        }
      />

      <LandingHeroSection
        content={landingContent.hero}
        onOpenParentAppInstallDialog={handleOpenParentAppInstallDialog}
        onScrollToFeature={handleScrollToFeature}
      />

      <LandingSignupSection id={LANDING_FEATURE_SECTION_ID} content={landingContent.signup} />

      <LandingAiAnalysisSection content={landingContent.aiAnalysis} />

      <LandingReportSection content={landingContent.report} />

      <LandingCtaSection
        content={landingContent.cta}
        onOpenParentAppInstallDialog={handleOpenParentAppInstallDialog}
        onScrollToFeature={handleScrollToFeature}
      />

      <LandingFooter>
        <FooterCopyright />
      </LandingFooter>

      <ParentAppInstallDialog
        isOpen={isParentAppInstallDialogOpen}
        onClose={handleCloseParentAppInstallDialog}
        onOpenDistributionPage={handleOpenDistributionPage}
      />
    </LandingPageContainer>
  );
};

const LandingPageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.bg1};
`;

const HeaderActionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
`;

const LandingFooter = styled.footer`
  padding: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.border1};
`;
