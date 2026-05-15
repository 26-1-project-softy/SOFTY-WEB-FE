import { queryOptions } from '@tanstack/react-query';
import { aiModelApi } from '@/services/admin/aiModelApi';
import { aiModelQueryKeys } from '@/features/admin/aiModel/constants/aiModelQueryKeys';

export const tokenUsageQueryOptions = () =>
  queryOptions({
    queryKey: aiModelQueryKeys.tokenUsage(),
    queryFn: async () => {
      const response = await aiModelApi.getTokenUsage();

      if (!response.success) {
        throw new Error(response.message || '토큰 사용량을 불러오지 못했어요.');
      }

      return response.data;
    },
  });
