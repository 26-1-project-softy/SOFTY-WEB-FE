import { queryOptions } from '@tanstack/react-query';
import { aiModelQueryKeys } from '@/features/admin/aiModel/constants/aiModelQueryKeys';
import { aiModelApi } from '@/services/admin/aiModelApi';

export const latestModelInfoQueryOptions = () =>
  queryOptions({
    queryKey: aiModelQueryKeys.latestModelInfo(),
    queryFn: async () => {
      const response = await aiModelApi.getLatestModelInfo();

      if (!response.success) {
        throw new Error(response.message || '최신 모델 정보를 불러오지 못했어요.');
      }

      return response.data;
    },
  });
