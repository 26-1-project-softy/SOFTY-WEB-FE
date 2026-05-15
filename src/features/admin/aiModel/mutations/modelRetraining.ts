import { aiModelApi } from '@/services/admin/aiModelApi';

export const retrainModel = async () => {
  const response = await aiModelApi.retrainModel();

  if (!response.success || !response.data) {
    throw new Error(response.message || '재학습 요청에 실패했어요.');
  }

  return response.data;
};
