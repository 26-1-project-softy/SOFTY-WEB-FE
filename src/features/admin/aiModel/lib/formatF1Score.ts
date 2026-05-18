import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';

export const isValidF1Score = (score: unknown): score is number => {
  return typeof score === 'number' && Number.isFinite(score);
};

export const formatF1Score = (score: ValueType | number | null | undefined) => {
  if (!isValidF1Score(score)) {
    return '-';
  }

  return score.toFixed(2);
};
