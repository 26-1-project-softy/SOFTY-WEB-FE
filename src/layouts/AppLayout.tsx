import styled from '@emotion/styled';
import { type ReactNode, useState } from 'react';
import { Outlet, useLocation, useMatches } from 'react-router-dom';
import { useDashboardTabs } from '@/features/admin/dashboard/hooks/useDashboardTabs';
import { Sidebar } from '@/components/common/Sidebar';
import { Header } from '@/components/common/Header';
import { Tabs } from '@/components/admin/dashboard/Tabs';
import type { AppRouteHandle } from '@/router/types';
import { HEADER_HEIGHT, SIDEBAR_WIDTH } from '@/constants/layout';

type AppRouteMatch = {
  handle?: AppRouteHandle;
};

export type AppLayoutOutletContext = {
  setHeaderActions: (actions?: ReactNode) => void;
  activeTab?: string;
};

export const AppLayout = () => {
  const matches = useMatches() as AppRouteMatch[];
  const { pathname } = useLocation();
  const [headerActionState, setHeaderActionState] = useState<{
    pathname: string;
    actions?: ReactNode;
  }>({ pathname });

  const headerActions =
    headerActionState.pathname === pathname ? headerActionState.actions : undefined;
  const setHeaderActions = (actions?: ReactNode) => {
    setHeaderActionState({ pathname, actions });
  };
  const currentMatch = [...matches].reverse().find(match => match.handle);

  const title = currentMatch?.handle?.title;
  const tabsConfig = currentMatch?.handle?.tabs;

  const firstTab = tabsConfig?.items[0]?.id ?? '';
  const [activeTab, setActiveTab] = useState<string>(firstTab);

  const validActiveTab =
    tabsConfig && tabsConfig.items.length > 0
      ? (tabsConfig.items.find(i => i.id === activeTab)?.id ?? tabsConfig.items[0].id)
      : '';

  const { indicatorStyle, setTabRef } = useDashboardTabs(validActiveTab);

  return (
    <Shell>
      <Sidebar />
      <Main>
        {title && <Header title={title} actions={headerActions} />}

        {tabsConfig?.items.length ? (
          <Tabs
            items={tabsConfig.items}
            activeId={validActiveTab}
            onChange={setActiveTab}
            indicatorStyle={indicatorStyle}
            setTabRef={setTabRef}
          />
        ) : null}

        <Content>
          <Outlet
            context={{
              setHeaderActions,
              activeTab: validActiveTab,
            }}
          />
        </Content>
      </Main>
    </Shell>
  );
};

const Shell = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.bg2};
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100vh;
  margin-left: ${SIDEBAR_WIDTH.closed}px;
`;

const Content = styled.main`
  height: calc(100vh - ${HEADER_HEIGHT}px);
  min-height: 0;
  margin-top: ${HEADER_HEIGHT}px;
`;
