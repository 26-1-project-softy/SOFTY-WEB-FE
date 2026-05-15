import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/useToast';
import { latestModelInfoQueryOptions } from '@/features/admin/aiModel/queries/modelInfo';
import { latestEvaluationQueryOptions } from '@/features/admin/aiModel/queries/modelEvaluation';
import { retrainModel } from '@/features/admin/aiModel/mutations/modelRetraining';
import { aiModelQueryKeys } from '@/features/admin/aiModel/constants/aiModelQueryKeys';
import { PERFORMANCE_DEGRADATION_THRESHOLD } from '@/features/admin/aiModel/constants/modelEvaluation';

const MODEL_INFO_REFETCH_INTERVAL = 3000;

const isTrainingInProgressStatus = (status?: string | null) => {
  return status === 'queued' || status === 'running';
};

export const useModelRetraining = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const isRetrainTriggeredRef = useRef(false);
  const retrainBaseJobIdRef = useRef<string | null>(null);

  const {
    data: latestModelInfo,
    isLoading: isModelInfoLoading,
    isError: isModelInfoError,
  } = useQuery({
    ...latestModelInfoQueryOptions(),
    refetchInterval: query => {
      const status = query.state.data?.status;

      return isTrainingInProgressStatus(status) ? MODEL_INFO_REFETCH_INTERVAL : false;
    },
  });

  const {
    data: latestEvaluation,
    isLoading: isEvaluationLoading,
    isError: isEvaluationError,
  } = useQuery(latestEvaluationQueryOptions());

  const status = latestModelInfo?.status;
  const jobId = latestModelInfo?.jobId;

  const isRetrainingInProgress = isTrainingInProgressStatus(status);
  const isRetrainingFailed = status === 'failed';

  const isPerformanceDegraded =
    latestEvaluation?.status === 'completed' &&
    latestEvaluation.f1Score < PERFORMANCE_DEGRADATION_THRESHOLD;

  useEffect(() => {
    if (
      isRetrainTriggeredRef.current &&
      status === 'completed' &&
      jobId &&
      jobId !== retrainBaseJobIdRef.current
    ) {
      showToast('모델 재학습이 완료되었어요', 'success');
      isRetrainTriggeredRef.current = false;

      void queryClient.invalidateQueries({
        queryKey: aiModelQueryKeys.latestModelInfo(),
      });

      void queryClient.invalidateQueries({
        queryKey: aiModelQueryKeys.latestEvaluation(),
      });
    }

    if (isRetrainTriggeredRef.current && status === 'failed') {
      isRetrainTriggeredRef.current = false;
    }
  }, [jobId, queryClient, showToast, status]);

  const retrainMutation = useMutation({
    mutationFn: retrainModel,
    onSuccess: async () => {
      isRetrainTriggeredRef.current = true;

      showToast('모델 재학습을 시작했어요', 'success');

      await queryClient.invalidateQueries({
        queryKey: aiModelQueryKeys.latestModelInfo(),
      });

      await queryClient.invalidateQueries({
        queryKey: aiModelQueryKeys.latestEvaluation(),
      });

      await queryClient.refetchQueries({
        queryKey: aiModelQueryKeys.latestModelInfo(),
      });
    },
    onError: () => {
      isRetrainTriggeredRef.current = false;
      showToast('모델 재학습 요청에 실패했어요', 'error');
    },
  });

  const handleRetrain = () => {
    if (retrainMutation.isPending || isRetrainingInProgress) {
      return;
    }

    retrainBaseJobIdRef.current = latestModelInfo?.jobId ?? null;
    retrainMutation.reset();
    retrainMutation.mutate();
  };

  return {
    latestModelInfo,
    latestEvaluation,
    isLoading: isModelInfoLoading || isEvaluationLoading,
    isError: isModelInfoError || isEvaluationError,
    isRetrainingInProgress,
    isRetrainingFailed,
    isPerformanceDegraded,
    isRetraining: retrainMutation.isPending || isRetrainingInProgress,
    retrainError: retrainMutation.isError,
    handleRetrain,
  };
};
