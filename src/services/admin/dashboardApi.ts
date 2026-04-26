import { apiClient } from '@/services/http/apiClient';
import type {
  PdfStatistics,
  PdfTeacherStatistics,
  RecommendationStatistics,
  RiskStatistics,
} from '@/features/admin/dashboard/types/dashboard';

type ApiResponse<T> = {
  success: boolean;
  code: number;
  message: string;
  data: T;
};

type RecommendationStatisticsResponse = {
  adoptionRate: number;
  totalUsedAsIs: number;
  totalModified: number;
  totalNotUsed: number;
};

type RiskStatisticsItemResponse = {
  totalMessageCount: number;
  detectedConflictCount: number;
  conflictDetectionRate: number;
};

type PdfStatisticsResponse = {
  totalPdfCount: number;
  list: PdfTeacherStatistics[];
};

const toSafeNumber = (value: unknown) => {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
};

const normalizeRiskStatistics = (data: unknown): RiskStatistics => {
  const riskData = Array.isArray(data) ? data[0] : data;

  if (!riskData || typeof riskData !== 'object') {
    return {
      totalMessageCount: 0,
      detectedConflictCount: 0,
      conflictDetectionRate: 0,
    };
  }

  const typedRiskData = riskData as Partial<RiskStatisticsItemResponse>;

  return {
    totalMessageCount: toSafeNumber(typedRiskData.totalMessageCount),
    detectedConflictCount: toSafeNumber(typedRiskData.detectedConflictCount),
    conflictDetectionRate: toSafeNumber(typedRiskData.conflictDetectionRate),
  };
};

const normalizePdfStatistics = (data: unknown): PdfStatistics => {
  const pdfData = Array.isArray(data) ? data[0] : data;

  if (!pdfData || typeof pdfData !== 'object') {
    return {
      totalPdfCount: 0,
      list: [],
    };
  }

  const typedPdfData = pdfData as Partial<PdfStatisticsResponse>;

  return {
    totalPdfCount: toSafeNumber(typedPdfData.totalPdfCount),
    list: Array.isArray(typedPdfData.list)
      ? typedPdfData.list.map(item => ({
          teacherId: toSafeNumber(item.teacherId),
          teacherName: item.teacherName ?? '',
          pdfCount: toSafeNumber(item.pdfCount),
        }))
      : [],
  };
};

export const dashboardApi = {
  getRecommendationStatistics: async () => {
    const { data } = await apiClient.get<ApiResponse<RecommendationStatisticsResponse>>(
      '/admin/statistics/recommendation-adoption'
    );

    return {
      adoptionRate: toSafeNumber(data.data.adoptionRate),
      totalUsedAsIs: toSafeNumber(data.data.totalUsedAsIs),
      totalModified: toSafeNumber(data.data.totalModified),
      totalNotUsed: toSafeNumber(data.data.totalNotUsed),
    } satisfies RecommendationStatistics;
  },

  getRiskStatistics: async () => {
    const { data } =
      await apiClient.get<ApiResponse<RiskStatisticsItemResponse[] | RiskStatistics>>(
        '/admin/statistics/risk'
      );

    return normalizeRiskStatistics(data.data);
  },

  getPdfStatistics: async () => {
    const { data } =
      await apiClient.get<ApiResponse<PdfStatisticsResponse[] | PdfStatistics>>(
        '/admin/statistics/pdfs'
      );

    return normalizePdfStatistics(data.data);
  },
};
