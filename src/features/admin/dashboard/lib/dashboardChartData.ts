import type {
  PdfTeacherStatistics,
  RecommendationStatistics,
  RiskStatistics,
} from '@/features/admin/dashboard/types/dashboard';

export const getRecommendationChartData = (data: RecommendationStatistics) => {
  return [
    { label: '그대로 사용', value: data.totalUsedAsIs },
    { label: '일부 수정', value: data.totalModified },
    { label: '미사용', value: data.totalNotUsed },
  ];
};

export const getRiskChartData = (data: RiskStatistics) => {
  const detectedConflictRate = data.conflictDetectionRate;
  const safeRate = Math.max(100 - detectedConflictRate, 0);

  return [
    {
      name: '분쟁 리스크 비율',
      detectedConflictRate,
      safeRate,
    },
  ];
};

export const getPdfChartData = (pdfList: PdfTeacherStatistics[]) => {
  return pdfList.map(item => ({
    teacherId: item.teacherId,
    teacherName: item.teacherName,
    pdfCount: item.pdfCount,
  }));
};
