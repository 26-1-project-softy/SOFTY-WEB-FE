import { useState } from 'react';
import styled from '@emotion/styled';
import { ErrorReviewList } from '@/components/common/errorReview/ErrorReviewList';
import { Loader } from '@/components/common/Loader';
import { SectionEmptyState } from '@/components/common/SectionEmptyState';
import { SectionErrorState } from '@/components/common/SectionErrorState';
import { InlineButton } from '@/components/common/InlineButton';
import { SelectDropdown } from '@/components/common/SelectDropdown';
import { DatePickerDropdown } from '@/components/errorReview/DatePickerDropdown';
import { TextField } from '@/components/common/TextField';
import { useAdminErrorReview } from '@/features/admin/errorReview/hooks/useAdminErrorReview';
import {
  ERROR_REVIEW_FEEDBACK_SCORE_OPTIONS,
  ERROR_REVIEW_RISK_LEVEL_OPTIONS,
  ERROR_REVIEW_TEXT,
} from '@/features/admin/errorReview/constants';
import { IcErrorReview } from '@/icons';

const ERROR_REVIEW_PAGE_LAYOUT = {
  headerHeight: '72px',
  pagePadding: '16px',
  contentTopMargin: '12px',
  paginationTopMargin: '12px',
  stateHeightOffset: '220px',
  iconSize: '24px',
} as const;

const ERROR_REVIEW_FILTER_LAYOUT = {
  columnsDesktop: 7,
  columnsTablet: 4,
  columnsMobile: 2,
  gap: '12px',
  breakpointTablet: '1280px',
  breakpointMobile: '900px',
  controlHeight: '42px',
  controlHorizontalPadding: '14px',
} as const;

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
          placeholder={ERROR_REVIEW_TEXT.riskLevelPlaceholder}
          hasSelected={hasRiskLevelSelected}
          onChange={value => {
            setHasRiskLevelSelected(true);
            setDraftFilters(prev => ({ ...prev, riskLevel: value }));
          }}
        />

        <SelectDropdown
          value={draftFilters.feedbackResult}
          options={ERROR_REVIEW_FEEDBACK_SCORE_OPTIONS}
          placeholder={ERROR_REVIEW_TEXT.feedbackPlaceholder}
          hasSelected={hasFeedbackSelected}
          onChange={value => {
            setHasFeedbackSelected(true);
            setDraftFilters(prev => ({ ...prev, feedbackResult: value }));
          }}
        />

        <FieldWrap>
          <TextField
            type="text"
            placeholder={ERROR_REVIEW_TEXT.teacherNamePlaceholder}
            value={draftFilters.teacherName}
            onChange={e => setDraftFilters(prev => ({ ...prev, teacherName: e.target.value }))}
          />
        </FieldWrap>

        <FieldWrap>
          <DatePickerDropdown
            placeholder={ERROR_REVIEW_TEXT.startDatePlaceholder}
            value={draftFilters.startDate}
            onChange={value => setDraftFilters(prev => ({ ...prev, startDate: value }))}
          />
        </FieldWrap>

        <FieldWrap>
          <DatePickerDropdown
            placeholder={ERROR_REVIEW_TEXT.endDatePlaceholder}
            value={draftFilters.endDate}
            onChange={value => setDraftFilters(prev => ({ ...prev, endDate: value }))}
          />
        </FieldWrap>

        <ButtonWrap>
          <InlineButton
            type="button"
            variant={hasSelectedFilters ? 'primary' : 'ghost'}
            size="L"
            width="100%"
            label={ERROR_REVIEW_TEXT.searchButtonLabel}
            onClick={handleApplyFilters}
          />
        </ButtonWrap>
        <ButtonWrap>
          <InlineButton
            type="button"
            variant="ghost"
            size="L"
            width="100%"
            label={ERROR_REVIEW_TEXT.resetButtonLabel}
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
          {ERROR_REVIEW_TEXT.paginationMeta(totalElements, page, totalPages)}
        </PaginationMeta>
        <PaginationButtons>
          <InlineButton
            type="button"
            variant="ghost"
            size="M"
            label={ERROR_REVIEW_TEXT.previousButtonLabel}
            disabled={isFirstPage}
            onClick={() => setPage(page - 1)}
          />
          <InlineButton
            type="button"
            variant="ghost"
            size="M"
            label={ERROR_REVIEW_TEXT.nextButtonLabel}
            disabled={isLastPage}
            onClick={() => setPage(page + 1)}
          />
        </PaginationButtons>
      </PaginationBar>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  min-height: calc(100vh - ${ERROR_REVIEW_PAGE_LAYOUT.headerHeight});
  padding: ${ERROR_REVIEW_PAGE_LAYOUT.pagePadding};
  background: ${({ theme }) => theme.colors.background.bg2};
  border-top: 1px solid ${({ theme }) => theme.colors.border.border1};
`;

const FilterBar = styled.div`
  display: grid;
  grid-template-columns: repeat(${ERROR_REVIEW_FILTER_LAYOUT.columnsDesktop}, minmax(0, 1fr));
  gap: ${ERROR_REVIEW_FILTER_LAYOUT.gap};
  align-items: start;

  @media (max-width: ${ERROR_REVIEW_FILTER_LAYOUT.breakpointTablet}) {
    grid-template-columns: repeat(${ERROR_REVIEW_FILTER_LAYOUT.columnsTablet}, minmax(0, 1fr));
  }

  @media (max-width: ${ERROR_REVIEW_FILTER_LAYOUT.breakpointMobile}) {
    grid-template-columns: repeat(${ERROR_REVIEW_FILTER_LAYOUT.columnsMobile}, minmax(0, 1fr));
  }
`;

const FieldWrap = styled.div`
  > div {
    gap: 0;
  }

  input {
    ${({ theme }) => theme.fonts.labelS};
    height: ${ERROR_REVIEW_FILTER_LAYOUT.controlHeight};
    padding: 0 ${ERROR_REVIEW_FILTER_LAYOUT.controlHorizontalPadding};
  }

  input[type='date'] {
    ${({ theme }) => theme.fonts.labelS};
    color: ${({ theme }) => theme.colors.text.text1};
    border-radius: 8px;
    accent-color: ${({ theme }) => theme.colors.brand.primary};
  }
`;

const ButtonWrap = styled.div`
  width: 100%;

  button {
    height: ${ERROR_REVIEW_FILTER_LAYOUT.controlHeight};
    padding: 0 ${ERROR_REVIEW_FILTER_LAYOUT.controlHorizontalPadding};
  }

  span {
    ${({ theme }) => theme.fonts.labelS};
  }
`;

const ContentArea = styled.div`
  margin-top: ${ERROR_REVIEW_PAGE_LAYOUT.contentTopMargin};
`;

const PageStateContainer = styled.div`
  height: calc(100vh - ${ERROR_REVIEW_PAGE_LAYOUT.stateHeightOffset});
`;

const EmptyStateWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.text.text4};

  svg {
    width: ${ERROR_REVIEW_PAGE_LAYOUT.iconSize};
    height: ${ERROR_REVIEW_PAGE_LAYOUT.iconSize};
  }
`;

const PaginationBar = styled.div`
  margin-top: ${ERROR_REVIEW_PAGE_LAYOUT.paginationTopMargin};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${ERROR_REVIEW_FILTER_LAYOUT.gap};
`;

const PaginationMeta = styled.span`
  ${({ theme }) => theme.fonts.body2};
  color: ${({ theme }) => theme.colors.text.text3};
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
`;
