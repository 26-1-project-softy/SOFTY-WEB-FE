export type DashboardTab = 'recommendation' | 'risk' | 'pdf';

export type RecommendationStatistics = {
  adoptionRate: number;
  totalUsedAsIs: number;
  totalModified: number;
  totalNotUsed: number;
};

export type RiskStatistics = {
  totalMessageCount: number;
  detectedConflictCount: number;
  conflictDetectionRate: number;
};

export type PdfTeacherStatistics = {
  teacherId: number;
  teacherName: string;
  pdfCount: number;
};

export type PdfStatistics = {
  totalPdfCount: number;
  list: PdfTeacherStatistics[];
};
