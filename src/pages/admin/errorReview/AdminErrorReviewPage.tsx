import styled from '@emotion/styled';
import { ErrorReviewList } from '@/components/errorReview/ErrorReviewList';
import { Loader } from '@/components/common/Loader';
import { SectionEmptyState } from '@/components/common/SectionEmptyState';
import { SectionErrorState } from '@/components/common/SectionErrorState';
import { InlineButton } from '@/components/common/InlineButton';
import { SelectDropdown } from '@/components/common/SelectDropdown';
import { FieldLabel } from '@/components/common/FieldLabel';
import { DatePickerDropdown } from '@/components/errorReview/DatePickerDropdown';
import { TextField } from '@/components/common/TextField';
import { useAdminErrorReview } from '@/features/admin/errorReview/hooks/useAdminErrorReview';
import {
  ERROR_REVIEW_FEEDBACK_SCORE_OPTIONS,
  ERROR_REVIEW_RISK_LEVEL_OPTIONS,
  ERROR_REVIEW_TEXT,
  ERROR_REVIEW_ALL_VALUE,
} from '@/features/admin/errorReview/constants';
import { IcErrorReview, IcRefresh } from '@/icons';
import { IconButton } from '@/components/common/IconButton';

const ERROR_REVIEW_PAGE_LAYOUT = {
  headerHeight: '72px',
  pagePadding: '16px',
  contentTopMargin: '12px',
  paginationTopMargin: '12px',
  stateHeightOffset: '220px',
  iconSize: '24px',
} as const;

const ERROR_REVIEW_FILTER_LAYOUT = {
  columnsDesktop: 5,
  columnsTablet: 2,
  gap: '12px',
  breakpointTablet: '780px',
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
  const hasSelectedFilters =
    draftFilters.riskLevel !== ERROR_REVIEW_ALL_VALUE ||
    draftFilters.feedbackResult !== ERROR_REVIEW_ALL_VALUE ||
    Boolean(draftFilters.teacherName.trim()) ||
    Boolean(draftFilters.startDate) ||
    Boolean(draftFilters.endDate);

  const handleResetAll = () => handleResetFilters();

  return (
    <PageContainer>
      <FilterBar>
        <FilterArea>
          <FieldWrap>
            <FilterControlRow>
              <FieldLabel label={ERROR_REVIEW_TEXT.riskLevelLabel} />
              <ControlWrap>
                <SelectDropdown
                  value={draftFilters.riskLevel}
                  options={ERROR_REVIEW_RISK_LEVEL_OPTIONS}
                  onChange={value => setDraftFilters(prev => ({ ...prev, riskLevel: value }))}
                />
              </ControlWrap>
            </FilterControlRow>
          </FieldWrap>

          <FieldWrap>
            <FilterControlRow>
              <FieldLabel label={ERROR_REVIEW_TEXT.feedbackLabel} />
              <ControlWrap>
                <SelectDropdown
                  value={draftFilters.feedbackResult}
                  options={ERROR_REVIEW_FEEDBACK_SCORE_OPTIONS}
                  onChange={value => setDraftFilters(prev => ({ ...prev, feedbackResult: value }))}
                />
              </ControlWrap>
            </FilterControlRow>
          </FieldWrap>

          <FieldWrap>
            <FilterControlRow>
              <FieldLabel label={ERROR_REVIEW_TEXT.teacherNameLabel} />
              <ControlWrap>
                <TextField
                  type="text"
                  placeholder={ERROR_REVIEW_TEXT.teacherNamePlaceholder}
                  value={draftFilters.teacherName}
                  onChange={e =>
                    setDraftFilters(prev => ({ ...prev, teacherName: e.target.value }))
                  }
                />
              </ControlWrap>
            </FilterControlRow>
          </FieldWrap>

          <PeriodFieldWrap>
            <FilterControlRow>
              <FieldLabel label={ERROR_REVIEW_TEXT.periodLabel} />
              <DatePickerDropdown
                placeholder={ERROR_REVIEW_TEXT.periodPlaceholder}
                startDate={draftFilters.startDate}
                endDate={draftFilters.endDate}
                onChange={(startDate, endDate) =>
                  setDraftFilters(prev => ({ ...prev, startDate, endDate }))
                }
              />
            </FilterControlRow>
          </PeriodFieldWrap>
        </FilterArea>
        <ButtonsArea>
          <IconButton type="button" variant="ghost" icon={IcRefresh} onClick={handleResetAll} />
          <InlineButton
            type="button"
            variant="primary"
            size="L"
            width="100%"
            label={ERROR_REVIEW_TEXT.searchButtonLabel}
            disabled={!hasSelectedFilters}
            onClick={handleApplyFilters}
          />
        </ButtonsArea>
      </FilterBar>

      <ContentArea>
        {isLoading ? (
          <PageStateContainer>
            <Loader />
          </PageStateContainer>
        ) : isError ? (
          <PageStateContainer>
            <SectionErrorState
              title={ERROR_REVIEW_TEXT.errorTitle}
              description={ERROR_REVIEW_TEXT.errorDescription}
              retryLabel={ERROR_REVIEW_TEXT.errorRetryLabel}
              onRetry={() => void refetch()}
            />
          </PageStateContainer>
        ) : items.length === 0 ? (
          <PageStateContainer>
            <EmptyStateWrap>
              <SectionEmptyState
                icon={IcErrorReview}
                title={ERROR_REVIEW_TEXT.emptyTitle}
                description={ERROR_REVIEW_TEXT.emptyDescription}
              />
            </EmptyStateWrap>
          </PageStateContainer>
        ) : (
          <>
            <ErrorReviewList items={items} expandedId={expandedId} onToggle={handleToggle} />

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
          </>
        )}
      </ContentArea>
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
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: ${ERROR_REVIEW_FILTER_LAYOUT.gap};
  padding: 0 16px;

  @media (max-width: ${ERROR_REVIEW_FILTER_LAYOUT.breakpointTablet}) {
    grid-template-columns: repeat(${ERROR_REVIEW_FILTER_LAYOUT.columnsTablet}, minmax(0, 1fr));
  }
`;

const FilterArea = styled.div`
  display: grid;
  grid-column: span 5;
  grid-template-columns: repeat(${ERROR_REVIEW_FILTER_LAYOUT.columnsDesktop}, minmax(0, 1fr));
  align-items: end;
  gap: ${ERROR_REVIEW_FILTER_LAYOUT.gap};
  min-width: 0;

  @media (max-width: ${ERROR_REVIEW_FILTER_LAYOUT.breakpointTablet}) {
    grid-column: 1 / -1;
    grid-template-columns: repeat(${ERROR_REVIEW_FILTER_LAYOUT.columnsTablet}, minmax(0, 1fr));
  }
`;

const ButtonsArea = styled.div`
  display: flex;
  grid-column: span 2;
  align-items: flex-end;
  gap: 10px;
  min-width: 0;

  button {
    height: ${ERROR_REVIEW_FILTER_LAYOUT.controlHeight};
  }

  @media (max-width: ${ERROR_REVIEW_FILTER_LAYOUT.breakpointTablet}) {
    grid-column: 1 / -1;
  }
`;

const FieldWrap = styled.div`
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

const FilterControlRow = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  width: 100%;
`;

const ControlWrap = styled.div`
  flex: 1;
  min-width: 0;
`;

const PeriodFieldWrap = styled(FieldWrap)`
  grid-column: span 2;
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
