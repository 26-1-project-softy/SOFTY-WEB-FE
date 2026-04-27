import styled from '@emotion/styled';
import { InlineButton } from '@/components/common/InlineButton';
import { IcError, IcRefresh } from '@/icons';

type InboxLoadState = 'error' | 'empty' | 'success';

export const TeacherThreadListPage = () => {
  const loadState: InboxLoadState = 'error';

  const handleRetry = () => {
    // TODO: 대화 목록 조회 API 연결 후 재시도 로직 연동
  };

  return (
    <ThreadListPageContainer>
      {loadState === 'error' ? (
        <ErrorStateSection>
          <ErrorIconWrap>
            <IcError />
          </ErrorIconWrap>
          <ErrorTitle>대화 목록을 불러올 수 없어요</ErrorTitle>
          <ErrorDescription>잠시 후 다시 시도해 주세요.</ErrorDescription>
          <RetryButton
            type="button"
            variant="primary"
            size="L"
            icon={IcRefresh}
            label="다시 시도"
            onClick={handleRetry}
          />
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

const RetryButton = styled(InlineButton)`
  margin-top: 14px;

  svg {
    width: 16px;
    height: 16px;
  }
`;
