import type { AdminRiskFeedbackListParams } from '@/features/admin/errorReview/types';

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
