import { RISK_ANALYSIS_TITLE, RISK_LEVEL } from '@/constants/riskAnalysis';
import { formatAiModelDateTime } from '@/utils/formatDateTime';
import type {
  AdminRiskFeedbackApiItem,
  AdminRiskFeedbackListParams,
  ErrorReviewItem,
  ErrorReviewTone,
} from '@/features/admin/errorReview/types';

export const ERROR_REVIEW_DEFAULT_EXPANDED_ID = 0;

export const ERROR_REVIEW_DEFAULT_QUERY_PARAMS: AdminRiskFeedbackListParams = {
  page: 1,
  size: 20,
};

export const ERROR_REVIEW_TEXT = {
  openItemAriaLabel: '오류 항목 열기',
  analysisTitle: '분석 메시지',
  riskTitle: '분쟁 가능성 분석 결과',
  loading: '오류 검토 목록을 불러오는 중입니다.',
  emptyTitle: '검토할 피드백이 없어요',
  emptyDescription: '아직 등록된 분쟁 리스크 피드백이 없어요.',
  errorTitle: '오류 검토 목록을 불러올 수 없어요',
  errorDescription: '잠시 후 다시 시도해주세요.',
  errorRetryLabel: '다시 시도',
} as const;

const getScoreTone = (score: number): ErrorReviewTone => {
  if (score <= 2) return 'danger';
  if (score === 3) return 'warning';
  return 'safe';
};

const getRiskTone = (riskLevel: AdminRiskFeedbackApiItem['riskLevel']): ErrorReviewTone => {
  return riskLevel === RISK_LEVEL.UNSAFE ? 'danger' : 'safe';
};

export const toErrorReviewItem = (item: AdminRiskFeedbackApiItem): ErrorReviewItem => {
  const score = Math.min(5, Math.max(1, Number(item.feedbackResult) || 1));

  return {
    id: item.feedbackId,
    scoreLabel: `${score}/5`,
    teacherName: item.teacherName || '-',
    reviewedAt: formatAiModelDateTime(item.createdAt),
    scoreTone: getScoreTone(score),
    riskTone: getRiskTone(item.riskLevel),
    analysisMessage: item.originalMessage || '-',
    riskResult: RISK_ANALYSIS_TITLE[item.riskLevel],
  };
};
