import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import { useTheme } from '@emotion/react';
import { IconButton } from '@/components/common/IconButton';
import { IcBack, IcBrandLogo } from '@/icons';
import { HEADER_HEIGHT } from '@/constants/layout';

type HeaderProps = {
  title: string;
  titleColor?: string;
  hasLogo?: boolean;
  onBack?: () => void;
  metaData?: ReactNode;
  actions?: ReactNode;
};

export const Header = ({ title, titleColor, hasLogo, onBack, metaData, actions }: HeaderProps) => {
  const theme = useTheme();
  const resolvedTitleColor = titleColor ?? theme.colors.text.text1;

  return (
    <HeaderContainer $hasBackBtn={Boolean(onBack)}>
      <LeadingContainer>
        {hasLogo && <IcBrandLogo style={{ flexShrink: 0 }} />}
        {onBack && (
          <IconButton
            icon={IcBack}
            variant="plain"
            onClick={onBack}
            accessibilityLabel="뒤로가기"
          />
        )}
        <HeaderTitle $color={resolvedTitleColor}>{title}</HeaderTitle>
        {metaData && metaData}
      </LeadingContainer>
      {actions && <ButtonsContainer>{actions}</ButtonsContainer>}
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header<{ $hasBackBtn: boolean }>`
  position: fixed;
  top: 0;
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: ${HEADER_HEIGHT}px;
  padding: ${({ $hasBackBtn }) => ($hasBackBtn ? '8px' : ' 10px 24px')};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.border2};
  background: ${({ theme }) => theme.colors.background.bg1};
`;

const LeadingContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: 10px;
`;

const HeaderTitle = styled.div<{ $color: string }>`
  ${({ theme }) => theme.fonts.labelL};
  color: ${({ $color }) => $color};
`;

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;
