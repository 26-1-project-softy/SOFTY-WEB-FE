import { colors } from '@/styles/colors';

export const chartColors = {
  recommendation: {
    usedAsIs: colors.chart.recommendationUsedAsIs,
    modified: colors.chart.recommendationModified,
    notUsed: colors.chart.recommendationNotUsed,
  },
  riskDetection: {
    low: colors.chart.riskLow,
    high: colors.chart.riskHigh,
  },
  pdfReport: {
    primary: colors.chart.pdfPrimary,
  },
  performEvaluation: {
    precision: '#60CDE4',
    recall: '#8F86F8',
    f1Score: '#55B5A6',
  },
} as const;
