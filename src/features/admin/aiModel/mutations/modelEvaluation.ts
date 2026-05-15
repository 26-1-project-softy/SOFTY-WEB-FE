import { aiModelApi, type RerunModelEvaluationRequest } from '@/services/admin/aiModelApi';

export const rerunModelEvaluation = async (payload: RerunModelEvaluationRequest) => {
  const response = await aiModelApi.rerunEvaluation(payload);

  if (!response.success || !response.data) {
    throw new Error(response.message || '재평가 요청에 실패했어요.');
  }

  return response.data;
};
