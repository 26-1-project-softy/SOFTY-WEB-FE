import { RISK_ANALYSIS_TITLE, RISK_LEVEL } from '@/constants/riskAnalysis';
import { formatAiModelDateTime } from '@/utils/formatDateTime';
import type {
  AdminRiskFeedbackApiItem,
  ErrorReviewItem,
  ErrorReviewTone,
} from '@/features/admin/errorReview/types';

const getScoreTone = (score: number): ErrorReviewTone => {
  if (score <= 2) return 'danger';
  if (score === 3) return 'warning';

  return 'safe';
};

const getRiskTone = (riskLevel: AdminRiskFeedbackApiItem['riskLevel']): ErrorReviewTone => {
  return riskLevel === RISK_LEVEL.SAFE ? 'safe' : 'danger';
};

const getRiskResult = (riskLevel: AdminRiskFeedbackApiItem['riskLevel']): string => {
  return riskLevel === RISK_LEVEL.SAFE
    ? RISK_ANALYSIS_TITLE[RISK_LEVEL.SAFE]
    : RISK_ANALYSIS_TITLE[RISK_LEVEL.UNSAFE];
};

export const getErrorReviewItem = (item: AdminRiskFeedbackApiItem): ErrorReviewItem => {
  const score = Math.min(5, Math.max(1, Number(item.feedbackResult) || 1));

  return {
    id: item.feedbackId,
    scoreLabel: `${score}/5`,
    teacherName: item.teacherName || '-',
    reviewedAt: formatAiModelDateTime(item.createdAt),
    scoreTone: getScoreTone(score),
    riskTone: getRiskTone(item.riskLevel),
    analysisMessage: item.originalMessage || '-',
    riskResult: getRiskResult(item.riskLevel),
  };
};
