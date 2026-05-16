import { queryOptions } from '@tanstack/react-query';
import { aiModelQueryKeys } from '@/features/admin/aiModel/constants/aiModelQueryKeys';
import { aiModelApi } from '@/services/admin/aiModelApi';

export const latestEvaluationQueryOptions = (evaluationId?: string) =>
  queryOptions({
    queryKey: aiModelQueryKeys.latestEvaluation(evaluationId),
    queryFn: async () => {
      const response = await aiModelApi.getLatestEvaluation(evaluationId);

      if (!response.success) {
        throw new Error(response.message || '성능 평가를 불러오지 못했어요.');
      }

      return response.data;
    },
  });
