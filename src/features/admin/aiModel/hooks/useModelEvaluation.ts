import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/useToast';
import {
  latestEvaluationQueryOptions,
  latestModelInfoQueryOptions,
  rerunModelEvaluation,
} from '@/features/admin/aiModel/queries/aiModelQueries';
import type { LatestModelEvaluation } from '@/services/admin/aiModelApi';
import { aiModelQueryKeys } from '@/features/admin/aiModel/constants/aiModelQueryKeys';

const isInProgressStatus = (status?: LatestModelEvaluation['status'] | null) => {
  return status === 'queued' || status === 'running';
};

export const useModelEvaluation = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const prevStatusRef = useRef<LatestModelEvaluation['status'] | null>(null);
  const isRerunTriggeredRef = useRef(false);

  const {
    data: latestModelInfo,
    isLoading: isLatestModelInfoLoading,
    isError: isLatestModelInfoError,
  } = useQuery(latestModelInfoQueryOptions());

  const {
    data: evaluation,
    isLoading: isEvaluationLoading,
    isError: isEvaluationError,
  } = useQuery({
    ...latestEvaluationQueryOptions(),
    refetchInterval: query => {
      const status = query.state.data?.status;

      return isInProgressStatus(status) ? 3000 : false;
    },
  });

  const status = evaluation?.status;

  const isInProgress = isInProgressStatus(status);
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';

  useEffect(() => {
    if (
      isRerunTriggeredRef.current &&
      prevStatusRef.current !== 'completed' &&
      status === 'completed'
    ) {
      showToast('성능 평가가 완료되었어요', 'success');
      isRerunTriggeredRef.current = false;
    }

    prevStatusRef.current = status ?? null;
  }, [status, showToast]);

  const rerunMutation = useMutation({
    mutationFn: rerunModelEvaluation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: aiModelQueryKeys.latestEvaluation(),
      });

      await queryClient.invalidateQueries({
        queryKey: aiModelQueryKeys.latestModelInfo(),
      });
    },
  });

  const handleRerun = async () => {
    if (rerunMutation.isPending || isInProgress) return;

    const version = latestModelInfo?.modelVersion;
    const datasetVersion = latestModelInfo?.datasetVersion;

    if (!version || !datasetVersion) {
      showToast('평가할 모델 정보가 없어요', 'error');
      return;
    }

    rerunMutation.reset();
    isRerunTriggeredRef.current = true;

    try {
      await rerunMutation.mutateAsync({
        version,
        datasetVersion,
      });
    } catch {
      isRerunTriggeredRef.current = false;
    }
  };

  return {
    evaluation: isCompleted ? evaluation : null,
    status,
    isInProgress,
    isCompleted,
    isFailed,
    isLoading: isLatestModelInfoLoading || isEvaluationLoading,
    isError: isLatestModelInfoError || isEvaluationError,

    onRerun: handleRerun,

    isRerunning: rerunMutation.isPending || isInProgress,

    rerunError: rerunMutation.isError,
    resetRerunError: rerunMutation.reset,
  };
};
