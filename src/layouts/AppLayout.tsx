import styled from '@emotion/styled';
import { type ReactNode, useState } from 'react';
import { Outlet, useLocation, useMatches } from 'react-router-dom';
import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import type { AppRouteHandle } from '@/router/types';

type AppRouteMatch = {
  handle?: AppRouteHandle;
};

export type AppLayoutOutletContext = {
  setHeaderActions: (actions?: ReactNode) => void;
};

export const AppLayout = () => {
  const matches = useMatches() as AppRouteMatch[];
  const { pathname } = useLocation();
  const [headerActionState, setHeaderActionState] = useState<{
    pathname: string;
    actions?: ReactNode;
  }>({ pathname });

  const currentHeader = [...matches].reverse().find(match => match.handle != null)?.handle;
  const headerActions =
    headerActionState.pathname === pathname ? headerActionState.actions : undefined;
  const setHeaderActions = (actions?: ReactNode) => {
    setHeaderActionState({ pathname, actions });
  };

  return (
    <Shell>
      <Sidebar />
      <Main>
        {currentHeader && <Header title={currentHeader.title} actions={headerActions} />}
        <Content>
          <Outlet context={{ setHeaderActions }} />
        </Content>
      </Main>
    </Shell>
  );
};

const Shell = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.bg2};
`;

const Main = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
`;

const Content = styled.main`
  flex: 1;
`;
