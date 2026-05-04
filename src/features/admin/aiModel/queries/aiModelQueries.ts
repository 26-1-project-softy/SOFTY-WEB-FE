import { queryOptions } from '@tanstack/react-query';
import { aiModelApi, type RerunModelEvaluationRequest } from '@/services/admin/aiModelApi';
import { aiModelQueryKeys } from '@/features/admin/aiModel/constants/aiModelQueryKeys';

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

export const rerunModelEvaluation = async (payload: RerunModelEvaluationRequest) => {
  const response = await aiModelApi.rerunEvaluation(payload);

  if (!response.success || !response.data) {
    throw new Error(response.message || '재평가 요청에 실패했어요.');
  }

  return response.data;
};
