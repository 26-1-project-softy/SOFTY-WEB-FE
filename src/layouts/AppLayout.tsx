import styled from '@emotion/styled';
import { Outlet, useMatches } from 'react-router-dom';
import { Sidebar } from '@/components/common/Sidebar';
import { Header } from '@/components/common/Header';
import {
  TEACHER_SETTINGS_RESET_EVENT,
  TEACHER_SETTINGS_SAVE_EVENT,
} from '@/constants/teacherSettingsEvents';
import type { AppRouteHandle } from '@/router/types';

type AppRouteMatch = {
  handle?: AppRouteHandle;
};

export const AppLayout = () => {
  const matches = useMatches() as AppRouteMatch[];

  const currentHeader = [...matches].reverse().find(match => match.handle != null)?.handle;
  const dispatchTeacherSettingsEvent = (eventName: string) => {
    window.dispatchEvent(new CustomEvent(eventName));
  };

  const headerActions =
    currentHeader?.actionType === 'teacherSettings' ? (
      <>
        <GhostButton
          type="button"
          onClick={() => dispatchTeacherSettingsEvent(TEACHER_SETTINGS_RESET_EVENT)}
        >
          취소
        </GhostButton>
        <PrimaryButton
          type="button"
          onClick={() => dispatchTeacherSettingsEvent(TEACHER_SETTINGS_SAVE_EVENT)}
        >
          변경사항 저장
        </PrimaryButton>
      </>
    ) : undefined;

  return (
    <Shell>
      <Sidebar />
      <Main>
        {currentHeader && <Header title={currentHeader.title} actions={headerActions} />}
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

const GhostButton = styled.button`
  ${({ theme }) => theme.fonts.labelXS};
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background.bg1};
  color: ${({ theme }) => theme.colors.text.text1};
  padding: 10px 18px;
`;

const PrimaryButton = styled.button`
  ${({ theme }) => theme.fonts.labelXS};
  border: none;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.brand.primary};
  color: ${({ theme }) => theme.colors.text.textW};
  padding: 10px 18px;
`;
