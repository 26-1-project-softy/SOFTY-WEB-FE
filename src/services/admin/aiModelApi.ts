import type { ApiResponse } from '@/types/apiResponse';
import { apiClient } from '@/services/http/apiClient';

export type TrainingJobStatus = 'QUEUED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED';

export type LatestModelInfo = {
  jobId: string;
  modelName: string;
  modelVersion: string;
  datasetVersion: string;
  status: TrainingJobStatus;
  lastTrainedAt: string | null;
};

export type LatestModelEvaluationStatus = 'queued' | 'running' | 'completed' | 'failed';

export type LatestModelEvaluation = {
  evaluationId: string;
  precision: number;
  recall: number;
  f1Score: number;
  status: LatestModelEvaluationStatus;
  progressPercent: number | null;
  passed: boolean;
  version: string;
  resultCode: number;
  resultMessage: string;
};

export type RerunModelEvaluationRequest = {
  version: string;
  datasetVersion: string;
};

export type RerunModelEvaluationResult = {
  evaluationId: string;
  status: LatestModelEvaluationStatus;
  resultCode: number;
  resultMessage: string;
  contentType: string;
  version: string;
  datasetVersion: string;
};

export type RetrainModelResult = {
  jobId: string;
  status: TrainingJobStatus;
};

export type TrainingJobDetail = {
  jobId: string;
  modelName: string;
  modelVersion: string;
  datasetVersion: string;
  status: TrainingJobStatus;
  progressPercent: number | null;
  startedAt: string | null;
  finishedAt: string | null;
};

export type TrainingHistoryItem = {
  trainedAt: string;
  version: string;
  datasetVersion: string;
  f1Score: number | null;
  status: TrainingJobStatus;
};

export type TrainingHistory = {
  items: TrainingHistoryItem[];
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
};

export type TokenUsageSummary = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type TokenUsageDetail = {
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type TokenUsage = {
  totalUsage: TokenUsageSummary;
  details: TokenUsageDetail[];
};

export type TokenUsageResponse = ApiResponse<TokenUsage | null>;

export type LatestModelInfoResponse = ApiResponse<LatestModelInfo | null>;
export type LatestModelEvaluationResponse = ApiResponse<LatestModelEvaluation | null>;
export type RerunModelEvaluationResponse = ApiResponse<RerunModelEvaluationResult | null>;
export type RetrainModelResponse = ApiResponse<RetrainModelResult | null>;
export type TrainingJobDetailResponse = ApiResponse<TrainingJobDetail | null>;
export type TrainingHistoryResponse = ApiResponse<TrainingHistory>;

export const aiModelApi = {
  getLatestModelInfo: async () => {
    const { data } = await apiClient.get<LatestModelInfoResponse>('/admin/models/latest');

    return data;
  },

  getLatestEvaluation: async (evaluationId?: string) => {
    const { data } = await apiClient.get<LatestModelEvaluationResponse>(
      '/admin/models/latest/evaluation',
      {
        params: evaluationId ? { evaluationId } : undefined,
      }
    );

    return data;
  },

  rerunEvaluation: async (payload: RerunModelEvaluationRequest) => {
    const { data } = await apiClient.post<RerunModelEvaluationResponse>(
      '/admin/models/latest/evaluation/re-run',
      payload
    );

    return data;
  },

  retrainModel: async () => {
    const { data } = await apiClient.post<RetrainModelResponse>('/admin/retraining');

    return data;
  },

  getTrainingJob: async (jobId: string) => {
    const { data } = await apiClient.get<TrainingJobDetailResponse>(
      `/admin/training-jobs/${jobId}`
    );

    return data;
  },

  getTrainingHistory: async (params: { page: number; size: number }) => {
    const { data } = await apiClient.get<TrainingHistoryResponse>('/admin/training-jobs', {
      params,
    });

    return data;
  },

  getTokenUsage: async () => {
    const { data } = await apiClient.get<TokenUsageResponse>('/admin/statistics/token-usage');

    return data;
  },
};
