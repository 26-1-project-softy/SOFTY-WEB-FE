import { queryOptions } from '@tanstack/react-query';
import { aiModelApi } from '@/services/admin/aiModelApi';
import { aiModelQueryKeys } from '@/features/admin/aiModel/constants/aiModelQueryKeys';

export const trainingHistoryQueryOptions = (page: number, size: number) =>
  queryOptions({
    queryKey: aiModelQueryKeys.trainingHistory(page, size),
    queryFn: async () => {
      const response = await aiModelApi.getTrainingHistory({ page, size });

      if (!response.success) {
        throw new Error(response.message || '학습 이력을 불러오지 못했어요.');
      }

      return response.data;
    },
  });
