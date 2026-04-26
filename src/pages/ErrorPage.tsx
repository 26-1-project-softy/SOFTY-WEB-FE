import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { IconBadge } from '@/components/common/IconBadge';
import { InlineButton } from '@/components/common/InlineButton';
import type { IconComponent } from '@/types/icon';
import { IcError } from '@/icons';

type ErrorPageProps = {
  title: string;
  description: string;
  primaryBtnLabel: string;
  primaryBtnIcon: IconComponent;
  primaryTo: string;
  ghostBtnLabel?: string;
  ghostBtnIcon?: IconComponent;
  ghostTo?: string;
  isGhostGoBack?: boolean;
};

export const ErrorPage = ({
  title,
  description,
  primaryBtnLabel,
  primaryBtnIcon,
  primaryTo,
  ghostBtnLabel,
  ghostBtnIcon,
  ghostTo,
  isGhostGoBack = false,
}: ErrorPageProps) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleClickGhost = () => {
    if (isGhostGoBack) {
      navigate(-1);
      return;
    }

    if (!ghostTo) {
      return;
    }

    navigate(ghostTo, { replace: true });
  };

  return (
    <PageContainer>
      <IconBadge
        icon={IcError}
        size={68}
        iconSize={34}
        bgColor={theme.colors.semantic.errorSoft}
        color={theme.colors.semantic.error}
      />
      <ContentContainer>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </ContentContainer>
      <ButtonsContainer>
        {ghostBtnLabel && ghostTo && (
          <InlineButton
            variant="ghost"
            size="L"
            icon={ghostBtnIcon}
            label={ghostBtnLabel}
            onClick={handleClickGhost}
          />
        )}
        <InlineButton
          variant="primary"
          size="L"
          icon={primaryBtnIcon}
          label={primaryBtnLabel}
          onClick={() => navigate(primaryTo, { replace: true })}
        />
      </ButtonsContainer>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 16px;
  gap: 48px;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const Title = styled.span`
  ${({ theme }) => theme.fonts.title1};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const Description = styled.span`
  text-align: center;
  ${({ theme }) => theme.fonts.body1};
  color: ${({ theme }) => theme.colors.text.text1};
  white-space: pre-wrap;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
`;
