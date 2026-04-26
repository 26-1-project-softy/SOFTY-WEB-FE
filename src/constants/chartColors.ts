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
} as const;
