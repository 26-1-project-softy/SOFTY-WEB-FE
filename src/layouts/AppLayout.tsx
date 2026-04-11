import styled from '@emotion/styled';
import { Outlet, useMatches } from 'react-router-dom';
import { Sidebar } from '@/components/common/Sidebar';
import { Header } from '@/components/common/Header';
import type { AppRouteHandle } from '@/router/types';

type AppRouteMatch = {
  handle?: AppRouteHandle;
};

export const AppLayout = () => {
  const matches = useMatches() as AppRouteMatch[];

  const currentHeader = [...matches].reverse().find(match => match.handle != null)?.handle;

  return (
    <Shell>
      <Sidebar />
      <Main>
        {currentHeader && <Header title={currentHeader.title} />}
        <Content>
          <Outlet />
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
