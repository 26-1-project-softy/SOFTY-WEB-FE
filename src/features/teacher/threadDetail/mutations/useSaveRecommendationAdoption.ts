import { useMutation } from '@tanstack/react-query';
import { threadDetailApi } from '@/services/teacher/threadDetailApi';

export const useSaveRecommendationAdoption = () => {
  return useMutation({
    mutationFn: (analysisId: number) => {
      return threadDetailApi.saveRecommendationAdoption(analysisId);
    },
  });
};
