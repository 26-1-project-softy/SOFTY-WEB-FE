export const aiModelQueryKeys = {
  all: ['admin', 'ai-model'] as const,
  latestModelInfo: () => [...aiModelQueryKeys.all, 'latest-model-info'] as const,
  latestEvaluation: (evaluationId?: string) =>
    [...aiModelQueryKeys.all, 'latest-evaluation', evaluationId ?? 'latest'] as const,
  trainingHistory: (page: number, size: number) =>
    [...aiModelQueryKeys.all, 'training-history', page, size] as const,
};
