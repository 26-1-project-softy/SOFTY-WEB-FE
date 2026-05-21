import type {
  AdminRiskFeedbackFilterValues,
  AdminRiskFeedbackListParams,
} from '@/features/admin/errorReview/types';

const ERROR_REVIEW_DEFAULT_PAGE = 1;
const ERROR_REVIEW_DEFAULT_PAGE_SIZE = 10;
const ERROR_REVIEW_ALL_FILTER_VALUE = 'ALL';
const ERROR_REVIEW_FEEDBACK_SCORE_RANGE = [1, 2, 3, 4, 5] as const;
const ERROR_REVIEW_ONE_MINUTE_MS = 1000 * 60;
const ERROR_REVIEW_DEFAULT_ERROR_MESSAGE = '오류 검토 목록 조회에 실패했습니다.';
const ERROR_REVIEW_EMPTY_FILTER_VALUE = '';

export const ERROR_REVIEW_ALL_VALUE = ERROR_REVIEW_ALL_FILTER_VALUE;
export const ERROR_REVIEW_EMPTY_VALUE = ERROR_REVIEW_EMPTY_FILTER_VALUE;
export const ERROR_REVIEW_COLLAPSED_ID = 0;
export const ERROR_REVIEW_DEFAULT_EXPANDED_ID = ERROR_REVIEW_COLLAPSED_ID;
export const ERROR_REVIEW_QUERY_STALE_TIME_MS = ERROR_REVIEW_ONE_MINUTE_MS;
export const ERROR_REVIEW_FALLBACK_ERROR_MESSAGE = ERROR_REVIEW_DEFAULT_ERROR_MESSAGE;

export const ERROR_REVIEW_DEFAULT_QUERY_PARAMS: AdminRiskFeedbackListParams = {
  page: ERROR_REVIEW_DEFAULT_PAGE,
  size: ERROR_REVIEW_DEFAULT_PAGE_SIZE,
};

export const ERROR_REVIEW_DEFAULT_FILTERS: AdminRiskFeedbackFilterValues = {
  riskLevel: ERROR_REVIEW_ALL_FILTER_VALUE,
  feedbackResult: ERROR_REVIEW_ALL_FILTER_VALUE,
  teacherName: ERROR_REVIEW_EMPTY_FILTER_VALUE,
  startDate: ERROR_REVIEW_EMPTY_FILTER_VALUE,
  endDate: ERROR_REVIEW_EMPTY_FILTER_VALUE,
};

export const ERROR_REVIEW_RISK_LEVEL_OPTIONS = [
  { label: '전체', value: ERROR_REVIEW_ALL_FILTER_VALUE },
  { label: '안전', value: 'SAFE' },
  { label: '위험', value: 'UNSAFE' },
] as const;

export const ERROR_REVIEW_FEEDBACK_SCORE_OPTIONS = [
  { label: '전체', value: ERROR_REVIEW_ALL_FILTER_VALUE },
  ...ERROR_REVIEW_FEEDBACK_SCORE_RANGE.map(score => ({
    label: `${score}점`,
    value: score,
  })),
] as const;

export const ERROR_REVIEW_TEXT = {
  riskLevelPlaceholder: '위험도',
  feedbackPlaceholder: '피드백',
  teacherNamePlaceholder: '교사명 검색',
  periodPlaceholder: '조회 기간',
  startDatePlaceholder: '시작일',
  endDatePlaceholder: '종료일',
  searchButtonLabel: '조회',
  resetButtonLabel: '초기화',
  previousButtonLabel: '이전',
  nextButtonLabel: '다음',
  paginationMeta: (totalElements: number, page: number, totalPages: number) =>
    `총 ${totalElements}건 중 ${page} / ${totalPages} 페이지`,
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
