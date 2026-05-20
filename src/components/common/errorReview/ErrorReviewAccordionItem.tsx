import styled from '@emotion/styled';
import { IcDown } from '@/icons';
import type { ErrorReviewItem, ErrorReviewTone } from '@/features/admin/errorReview/types';
import { ERROR_REVIEW_TEXT } from '@/features/admin/errorReview/constants';

const ERROR_REVIEW_ACCORDION_STYLE = {
  radius: '18px',
  paddingExpanded: '18px 20px',
  paddingCollapsed: '16px 20px',
  headerGap: '10px',
  headerLeftGap: '14px',
  scoreBadgeMinWidth: '48px',
  scoreBadgePadding: '2px 12px',
  scoreBadgeRadius: '999px',
  bodyTopMargin: '16px',
  bodyGap: '10px',
  analysisBottomMargin: '14px',
  arrowTransitionDuration: '0.2s',
} as const;

type ErrorReviewAccordionItemProps = {
  item: ErrorReviewItem;
  isExpanded: boolean;
  onToggle: (id: number) => void;
};

export const ErrorReviewAccordionItem = ({
  item,
  isExpanded,
  onToggle,
}: ErrorReviewAccordionItemProps) => {
  return (
    <ReviewCard type="button" $expanded={isExpanded} onClick={() => onToggle(item.id)}>
      <ReviewHeader>
        <HeaderLeft>
          <ScoreBadge $tone={item.scoreTone}>{item.scoreLabel}</ScoreBadge>
          <TeacherName>{item.teacherName}</TeacherName>
          <ReviewedAt>{item.reviewedAt}</ReviewedAt>
        </HeaderLeft>
        <ArrowIcon $expanded={isExpanded} aria-label={ERROR_REVIEW_TEXT.openItemAriaLabel}>
          <IcDown />
        </ArrowIcon>
      </ReviewHeader>

      {isExpanded ? (
        <ReviewBody>
          <SectionTitle>{ERROR_REVIEW_TEXT.analysisTitle}</SectionTitle>
          <AnalysisMessage>{item.analysisMessage}</AnalysisMessage>

          <SectionTitle>{ERROR_REVIEW_TEXT.riskTitle}</SectionTitle>
          <RiskResult $tone={item.riskTone}>{item.riskResult}</RiskResult>
        </ReviewBody>
      ) : null}
    </ReviewCard>
  );
};

const ReviewCard = styled.button<{ $expanded: boolean }>`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border.border2};
  border-radius: ${ERROR_REVIEW_ACCORDION_STYLE.radius};
  background: ${({ theme }) => theme.colors.background.bg1};
  text-align: left;
  padding: ${({ $expanded }) =>
    $expanded
      ? ERROR_REVIEW_ACCORDION_STYLE.paddingExpanded
      : ERROR_REVIEW_ACCORDION_STYLE.paddingCollapsed};
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.text.text4};
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${ERROR_REVIEW_ACCORDION_STYLE.headerGap};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${ERROR_REVIEW_ACCORDION_STYLE.headerLeftGap};
  min-width: 0;
`;

const ScoreBadge = styled.span<{ $tone: ErrorReviewTone }>`
  ${({ theme }) => theme.fonts.labelS};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: ${ERROR_REVIEW_ACCORDION_STYLE.scoreBadgeMinWidth};
  padding: ${ERROR_REVIEW_ACCORDION_STYLE.scoreBadgePadding};
  border-radius: ${ERROR_REVIEW_ACCORDION_STYLE.scoreBadgeRadius};
  border: 1px solid
    ${({ $tone, theme }) => {
      if ($tone === 'danger') return theme.colors.semantic.error;
      if ($tone === 'warning') return theme.colors.semantic.warning;
      return theme.colors.semantic.success;
    }};
  color: ${({ $tone, theme }) => {
    if ($tone === 'danger') return theme.colors.semantic.error;
    if ($tone === 'warning') return theme.colors.semantic.warning;
    return theme.colors.semantic.success;
  }};
  background: ${({ $tone, theme }) => {
    if ($tone === 'danger') return theme.colors.semantic.errorSoft;
    if ($tone === 'warning') return theme.colors.semantic.warningSoft;
    return theme.colors.semantic.successSoft;
  }};
`;

const TeacherName = styled.span`
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ theme }) => theme.colors.text.text1};
  white-space: nowrap;
`;

const ReviewedAt = styled.span`
  ${({ theme }) => theme.fonts.body1};
  color: ${({ theme }) => theme.colors.text.text4};
  white-space: nowrap;
`;

const ArrowIcon = styled.span<{ $expanded: boolean }>`
  display: inline-flex;
  color: ${({ theme }) => theme.colors.text.text2};
  transform: rotate(${({ $expanded }) => ($expanded ? '180deg' : '0deg')});
  transition: transform ${ERROR_REVIEW_ACCORDION_STYLE.arrowTransitionDuration} ease;
`;

const ReviewBody = styled.div`
  margin-top: ${ERROR_REVIEW_ACCORDION_STYLE.bodyTopMargin};
  display: flex;
  flex-direction: column;
  gap: ${ERROR_REVIEW_ACCORDION_STYLE.bodyGap};
`;

const SectionTitle = styled.h3`
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const AnalysisMessage = styled.p`
  ${({ theme }) => theme.fonts.body1};
  margin: 0 0 ${ERROR_REVIEW_ACCORDION_STYLE.analysisBottomMargin};
  color: ${({ theme }) => theme.colors.text.text2};
`;

const RiskResult = styled.p<{ $tone: ErrorReviewTone }>`
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ $tone, theme }) =>
    $tone === 'danger' ? theme.colors.semantic.error : theme.colors.semantic.success};
`;
