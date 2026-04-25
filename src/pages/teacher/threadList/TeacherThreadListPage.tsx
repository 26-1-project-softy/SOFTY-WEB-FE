import styled from '@emotion/styled';
import { IcError, IcRefresh } from '@/icons';

type InboxLoadState = 'error' | 'empty' | 'success';

export const TeacherThreadListPage = () => {
  const loadState: InboxLoadState = 'error';

  const handleRetry = () => {
    // TODO: 대화 목록 조회 API 연결 시 재시도 로직 연동
  };

  return (
    <ThreadListPageContainer>
      {loadState === 'error' ? (
        <ErrorStateSection>
          <ErrorIconWrap>
            <IcError />
          </ErrorIconWrap>
          <ErrorTitle>대화 목록을 불러올 수 없어요</ErrorTitle>
          <ErrorDescription>잠시 후 다시 시도해주세요.</ErrorDescription>
          <RetryButton type="button" onClick={handleRetry}>
            <IcRefresh />
            다시 시도
          </RetryButton>
        </ErrorStateSection>
      ) : null}
    </ThreadListPageContainer>
  );
};

const ThreadListPageContainer = styled.section`
  min-height: calc(100vh - 72px);
  background: ${({ theme }) => theme.colors.background.bg2};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const ErrorStateSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const ErrorIconWrap = styled.span`
  color: ${({ theme }) => theme.colors.semantic.error};

  svg {
    width: 32px;
    height: 32px;
  }
`;

const ErrorTitle = styled.p`
  ${({ theme }) => theme.fonts.labelM};
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const ErrorDescription = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const RetryButton = styled.button`
  ${({ theme }) => theme.fonts.labelS};
  margin-top: 14px;
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  background: ${({ theme }) => theme.colors.brand.primary};
  color: ${({ theme }) => theme.colors.text.textW};
  display: inline-flex;
  align-items: center;
  gap: 6px;

  svg {
    width: 16px;
    height: 16px;
  }
`;
