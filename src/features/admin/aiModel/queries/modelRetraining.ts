import { queryOptions } from '@tanstack/react-query';
import { aiModelApi } from '@/services/admin/aiModelApi';
import { aiModelQueryKeys } from '@/features/admin/aiModel/constants/aiModelQueryKeys';

export const trainingJobQueryOptions = (jobId: string) => {
  return queryOptions({
    queryKey: aiModelQueryKeys.trainingJob(jobId),
    queryFn: async () => {
      const response = await aiModelApi.getTrainingJob(jobId);

      return response.data;
    },
    enabled: Boolean(jobId),
  });
};
