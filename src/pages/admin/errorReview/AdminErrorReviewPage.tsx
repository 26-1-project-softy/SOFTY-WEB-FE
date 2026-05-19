import { useState } from 'react';
import styled from '@emotion/styled';
import { ErrorReviewList } from '@/components/common/errorReview/ErrorReviewList';
import { Loader } from '@/components/common/Loader';
import { SectionEmptyState } from '@/components/common/SectionEmptyState';
import { SectionErrorState } from '@/components/common/SectionErrorState';
import { InlineButton } from '@/components/common/InlineButton';
import { SelectDropdown } from '@/components/common/SelectDropdown';
import { TextField } from '@/components/common/TextField';
import { useAdminErrorReview } from '@/features/admin/errorReview/hooks/useAdminErrorReview';
import {
  ERROR_REVIEW_FEEDBACK_SCORE_OPTIONS,
  ERROR_REVIEW_RISK_LEVEL_OPTIONS,
  ERROR_REVIEW_TEXT,
} from '@/features/admin/errorReview/constants';
import { IcErrorReview } from '@/icons';

export const AdminErrorReviewPage = () => {
  const {
    items,
    page,
    totalPages,
    totalElements,
    draftFilters,
    setDraftFilters,
    setPage,
    handleApplyFilters,
    handleResetFilters,
    expandedId,
    handleToggle,
    isLoading,
    isError,
    refetch,
  } = useAdminErrorReview();

  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;
  const [hasRiskLevelSelected, setHasRiskLevelSelected] = useState(false);
  const [hasFeedbackSelected, setHasFeedbackSelected] = useState(false);
  const hasSelectedFilters =
    hasRiskLevelSelected ||
    hasFeedbackSelected ||
    Boolean(draftFilters.teacherName.trim()) ||
    Boolean(draftFilters.startDate) ||
    Boolean(draftFilters.endDate);

  const handleResetAll = () => {
    setHasRiskLevelSelected(false);
    setHasFeedbackSelected(false);
    handleResetFilters();
  };

  return (
    <PageContainer>
      <FilterBar>
        <SelectDropdown
          value={draftFilters.riskLevel}
          options={ERROR_REVIEW_RISK_LEVEL_OPTIONS}
          placeholder="위험도"
          hasSelected={hasRiskLevelSelected}
          onChange={value => {
            setHasRiskLevelSelected(true);
            setDraftFilters(prev => ({ ...prev, riskLevel: value }));
          }}
        />

        <SelectDropdown
          value={draftFilters.feedbackResult}
          options={ERROR_REVIEW_FEEDBACK_SCORE_OPTIONS}
          placeholder="피드백"
          hasSelected={hasFeedbackSelected}
          onChange={value => {
            setHasFeedbackSelected(true);
            setDraftFilters(prev => ({ ...prev, feedbackResult: value }));
          }}
        />

        <FieldWrap>
          <TextField
            type="text"
            placeholder="교사명 검색"
            value={draftFilters.teacherName}
            onChange={e => setDraftFilters(prev => ({ ...prev, teacherName: e.target.value }))}
          />
        </FieldWrap>

        <FieldWrap>
          <TextField
            type={draftFilters.startDate ? 'date' : 'text'}
            placeholder="시작일"
            value={draftFilters.startDate}
            onFocus={e => {
              e.currentTarget.type = 'date';
            }}
            onBlur={e => {
              if (!e.currentTarget.value) e.currentTarget.type = 'text';
            }}
            onChange={e => setDraftFilters(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </FieldWrap>

        <FieldWrap>
          <TextField
            type={draftFilters.endDate ? 'date' : 'text'}
            placeholder="종료일"
            value={draftFilters.endDate}
            onFocus={e => {
              e.currentTarget.type = 'date';
            }}
            onBlur={e => {
              if (!e.currentTarget.value) e.currentTarget.type = 'text';
            }}
            onChange={e => setDraftFilters(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </FieldWrap>

        <ButtonWrap>
          <InlineButton
            type="button"
            variant={hasSelectedFilters ? 'primary' : 'ghost'}
            size="L"
            width="100%"
            label="조회"
            onClick={handleApplyFilters}
          />
        </ButtonWrap>
        <ButtonWrap>
          <InlineButton
            type="button"
            variant="ghost"
            size="L"
            width="100%"
            label="초기화"
            onClick={handleResetAll}
          />
        </ButtonWrap>
      </FilterBar>

      <ContentArea>
        {isLoading ? (
          <PageStateContainer>
            <Loader />
          </PageStateContainer>
        ) : null}

        {!isLoading && isError ? (
          <PageStateContainer>
            <SectionErrorState
              title={ERROR_REVIEW_TEXT.errorTitle}
              description={ERROR_REVIEW_TEXT.errorDescription}
              retryLabel={ERROR_REVIEW_TEXT.errorRetryLabel}
              onRetry={() => void refetch()}
            />
          </PageStateContainer>
        ) : null}

        {!isLoading && !isError && items.length === 0 ? (
          <PageStateContainer>
            <EmptyStateWrap>
              <SectionEmptyState
                icon={IcErrorReview}
                title={ERROR_REVIEW_TEXT.emptyTitle}
                description={ERROR_REVIEW_TEXT.emptyDescription}
              />
            </EmptyStateWrap>
          </PageStateContainer>
        ) : null}

        {!isLoading && !isError && items.length > 0 ? (
          <ErrorReviewList items={items} expandedId={expandedId} onToggle={handleToggle} />
        ) : null}
      </ContentArea>

      <PaginationBar>
        <PaginationMeta>
          총 {totalElements}건 · {page} / {totalPages} 페이지
        </PaginationMeta>
        <PaginationButtons>
          <InlineButton
            type="button"
            variant="ghost"
            size="M"
            label="이전"
            disabled={isFirstPage}
            onClick={() => setPage(page - 1)}
          />
          <InlineButton
            type="button"
            variant="ghost"
            size="M"
            label="다음"
            disabled={isLastPage}
            onClick={() => setPage(page + 1)}
          />
        </PaginationButtons>
      </PaginationBar>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  min-height: calc(100vh - 72px);
  padding: 16px;
  background: ${({ theme }) => theme.colors.background.bg2};
  border-top: 1px solid ${({ theme }) => theme.colors.border.border1};
`;

const FilterBar = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 12px;
  align-items: start;

  @media (max-width: 1280px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const FieldWrap = styled.div`
  > div {
    gap: 0;
  }

  input {
    height: 42px;
    padding: 0 14px;
  }

  input[type='date'] {
    ${({ theme }) => theme.fonts.body2};
    color: ${({ theme }) => theme.colors.text.text1};
    border-radius: 8px;
    accent-color: ${({ theme }) => theme.colors.brand.primary};
  }
`;

const ButtonWrap = styled.div`
  width: 100%;

  button {
    height: 42px;
    padding: 0 14px;
  }
`;

const ContentArea = styled.div`
  margin-top: 12px;
`;

const PageStateContainer = styled.div`
  height: calc(100vh - 220px);
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

const PaginationBar = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const PaginationMeta = styled.span`
  ${({ theme }) => theme.fonts.body2};
  color: ${({ theme }) => theme.colors.text.text3};
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
`;
