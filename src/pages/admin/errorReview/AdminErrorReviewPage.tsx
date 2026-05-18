import styled from '@emotion/styled';
import { ErrorReviewList } from '@/components/common/errorReview/ErrorReviewList';
import { Loader } from '@/components/common/Loader';
import { SectionEmptyState } from '@/components/common/SectionEmptyState';
import { SectionErrorState } from '@/components/common/SectionErrorState';
import { useAdminErrorReview } from '@/features/admin/errorReview/hooks/useAdminErrorReview';
import { ERROR_REVIEW_TEXT } from '@/features/admin/errorReview/constants';
import { IcErrorReview } from '@/icons';

export const AdminErrorReviewPage = () => {
  const { items, expandedId, handleToggle, isLoading, isError, refetch } = useAdminErrorReview();

  if (isLoading) {
    return (
      <PageStateContainer>
        <Loader />
      </PageStateContainer>
    );
  }

  if (isError) {
    return (
      <PageStateContainer>
        <SectionErrorState
          title={ERROR_REVIEW_TEXT.errorTitle}
          description={ERROR_REVIEW_TEXT.errorDescription}
          retryLabel={ERROR_REVIEW_TEXT.errorRetryLabel}
          onRetry={() => void refetch()}
        />
      </PageStateContainer>
    );
  }

  if (items.length === 0) {
    return (
      <PageStateContainer>
        <EmptyStateWrap>
          <SectionEmptyState
            icon={IcErrorReview}
            title={ERROR_REVIEW_TEXT.emptyTitle}
            description={ERROR_REVIEW_TEXT.emptyDescription}
          />
        </EmptyStateWrap>
      </PageStateContainer>
    );
  }

  return <ErrorReviewList items={items} expandedId={expandedId} onToggle={handleToggle} />;
};

const PageStateContainer = styled.div`
  height: calc(100vh - 72px);
  padding: 22px 16px 24px;
  background: ${({ theme }) => theme.colors.background.bg2};
  border-top: 1px solid ${({ theme }) => theme.colors.border.border1};
`;

const EmptyStateWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.text.text4};

  svg {
    width: 24px;
    height: 24px;
  }
`;
