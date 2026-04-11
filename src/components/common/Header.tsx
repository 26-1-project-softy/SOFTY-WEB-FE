import styled from '@emotion/styled';
import type { ReactNode } from 'react';

type HeaderProps = {
  title: string;
  actions?: ReactNode;
};

export const Header = ({ title, actions }: HeaderProps) => {
  return (
    <HeaderContainer>
      <HeaderTitle>{title}</HeaderTitle>
      {actions && <ButtonsContainer>{actions}</ButtonsContainer>}
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.border1};
  background: ${({ theme }) => theme.colors.background.bg1};
`;

const HeaderTitle = styled.div`
  flex: 1;
  min-width: 0;
  ${({ theme }) => theme.fonts.labelL};
`;

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;
