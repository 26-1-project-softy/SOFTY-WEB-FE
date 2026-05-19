import type {
  AdminRiskFeedbackFilterValues,
  AdminRiskFeedbackListParams,
} from '@/features/admin/errorReview/types';

export const ERROR_REVIEW_DEFAULT_EXPANDED_ID = 0;

export const ERROR_REVIEW_DEFAULT_QUERY_PARAMS: AdminRiskFeedbackListParams = {
  page: 1,
  size: 10,
};

export const ERROR_REVIEW_DEFAULT_FILTERS: AdminRiskFeedbackFilterValues = {
  riskLevel: 'ALL',
  feedbackResult: 'ALL',
  teacherName: '',
  startDate: '',
  endDate: '',
};

export const ERROR_REVIEW_RISK_LEVEL_OPTIONS = [
  { label: '전체', value: 'ALL' },
  { label: '안전', value: 'SAFE' },
  { label: '주의', value: 'WARNING' },
  { label: '위험', value: 'UNSAFE' },
] as const;

export const ERROR_REVIEW_FEEDBACK_SCORE_OPTIONS = [
  { label: '전체', value: 'ALL' },
  { label: '1점', value: 1 },
  { label: '2점', value: 2 },
  { label: '3점', value: 3 },
  { label: '4점', value: 4 },
  { label: '5점', value: 5 },
] as const;

export const ERROR_REVIEW_TEXT = {
  openItemAriaLabel: '오류 검토 항목 열기',
  analysisTitle: '분석 메시지',
  riskTitle: '분쟁 가능성 분석 결과',
  loading: '오류 검토 목록을 불러오는 중입니다.',
  emptyTitle: '검토할 피드백이 없어요',
  emptyDescription: '아직 등록된 분쟁 리스크 피드백이 없어요.',
  errorTitle: '오류 검토 목록을 불러올 수 없어요',
  errorDescription: '잠시 후 다시 시도해 주세요.',
  errorRetryLabel: '다시 시도',
} as const;
