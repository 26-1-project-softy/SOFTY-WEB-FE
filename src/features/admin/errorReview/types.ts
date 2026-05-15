export type ErrorReviewTone = 'danger' | 'warning' | 'safe';

export type ErrorReviewItem = {
  id: number;
  scoreLabel: string;
  teacherName: string;
  reviewedAt: string;
  tone: ErrorReviewTone;
  analysisMessage: string;
  riskResult: string;
};

export type AdminRiskFeedbackApiItem = {
  feedbackId: number;
  teacherName: string;
  feedbackResult: number;
  aiRecommendMessage: string;
  createdAt: string;
};

export type AdminRiskFeedbackListData = {
  items: AdminRiskFeedbackApiItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type AdminRiskFeedbackListParams = {
  page: number;
  size: number;
};
