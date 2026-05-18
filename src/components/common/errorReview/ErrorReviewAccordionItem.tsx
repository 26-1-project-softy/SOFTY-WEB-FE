import styled from '@emotion/styled';
import { IcDown } from '@/icons';
import type { ErrorReviewItem, ErrorReviewTone } from '@/features/admin/errorReview/types';
import { ERROR_REVIEW_TEXT } from '@/features/admin/errorReview/constants';

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
  border-radius: 18px;
  background: ${({ theme }) => theme.colors.background.bg1};
  text-align: left;
  padding: ${({ $expanded }) => ($expanded ? '18px 20px' : '16px 20px')};
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.text.text4};
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
`;

const ScoreBadge = styled.span<{ $tone: ErrorReviewTone }>`
  ${({ theme }) => theme.fonts.labelS};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  padding: 2px 12px;
  border-radius: 999px;
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
  transition: transform 0.2s ease;
`;

const ReviewBody = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionTitle = styled.h3`
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const AnalysisMessage = styled.p`
  ${({ theme }) => theme.fonts.body1};
  margin: 0 0 14px;
  color: ${({ theme }) => theme.colors.text.text2};
`;

const RiskResult = styled.p<{ $tone: ErrorReviewTone }>`
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ $tone, theme }) =>
    $tone === 'danger' ? theme.colors.semantic.error : theme.colors.semantic.success};
`;
