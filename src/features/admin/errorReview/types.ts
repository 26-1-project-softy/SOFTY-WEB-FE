import type { RiskLevel } from '@/constants/riskAnalysis';

export type ErrorReviewTone = 'danger' | 'warning' | 'safe';

export type ErrorReviewItem = {
  id: number;
  scoreLabel: string;
  teacherName: string;
  reviewedAt: string;
  scoreTone: ErrorReviewTone;
  riskTone: ErrorReviewTone;
  analysisMessage: string;
  riskResult: string;
};

export type AdminRiskFeedbackApiItem = {
  feedbackId: number;
  teacherName: string;
  feedbackResult: number;
  riskLevel: RiskLevel;
  originalMessage: string;
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
  riskLevel?: 'ALL' | RiskLevel;
  feedbackResult?: 'ALL' | 1 | 2 | 3 | 4 | 5;
  teacherName?: string;
  startDate?: string;
  endDate?: string;
};

export type AdminRiskFeedbackFilterValues = {
  riskLevel: 'ALL' | RiskLevel;
  feedbackResult: 'ALL' | 1 | 2 | 3 | 4 | 5;
  teacherName: string;
  startDate: string;
  endDate: string;
};
