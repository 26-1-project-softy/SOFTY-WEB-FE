import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import { useTheme } from '@emotion/react';
import { IcBrandLogo } from '@/icons';

type HeaderProps = {
  title: string;
  titleColor?: string;
  hasLogo?: boolean;
  actions?: ReactNode;
};

export const Header = ({ title, titleColor, hasLogo, actions }: HeaderProps) => {
  const theme = useTheme();
  const resolvedTitleColor = titleColor ?? theme.colors.text.text1;

  return (
    <HeaderContainer>
      <LeadingContainer>
        {hasLogo && <IcBrandLogo style={{ flexShrink: 0 }} />}
        <HeaderTitle $color={resolvedTitleColor}>{title}</HeaderTitle>
      </LeadingContainer>
      {actions && <ButtonsContainer>{actions}</ButtonsContainer>}
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 74px;
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.border1};
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
