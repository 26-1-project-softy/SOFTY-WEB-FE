export const getPerformanceChartData = (data: {
  precision: number;
  recall: number;
  f1Score: number;
}) => [
  { label: 'Precision', value: data.precision * 100 },
  { label: 'Recall', value: data.recall * 100 },
  { label: 'F1-score', value: data.f1Score * 100 },
];
