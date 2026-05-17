import { useMutation } from '@tanstack/react-query';
import { threadDetailApi } from '@/services/teacher/threadDetailApi';

type SaveAnalysisFeedbackParams = {
  analysisId: number;
  score: number;
};

export const useSaveAnalysisFeedback = () => {
  return useMutation({
    mutationFn: ({ analysisId, score }: SaveAnalysisFeedbackParams) => {
      return threadDetailApi.saveAnalysisFeedback(analysisId, score);
    },
  });
};
