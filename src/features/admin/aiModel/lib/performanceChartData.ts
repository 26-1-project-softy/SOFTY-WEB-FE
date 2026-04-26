export const getPerformanceChartData = (data: {
  precision: number;
  recall: number;
  f1Score: number;
}) => [
  { label: 'Precision', value: data.precision },
  { label: 'Recall', value: data.recall },
  { label: 'F1-score', value: data.f1Score },
];
