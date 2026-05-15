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

const EVALUATION_REFETCH_INTERVAL = 2000;

const isInProgressStatus = (status?: LatestModelEvaluation['status'] | null) => {
  return status === 'queued' || status === 'running';
};

const getSafeProgressPercent = (progressPercent?: number | null) => {
  if (typeof progressPercent !== 'number' || !Number.isFinite(progressPercent)) {
    return 0;
  }

  return Math.min(100, Math.max(0, progressPercent));
};

export const useModelEvaluation = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const isWaitingRerunCompletionRef = useRef(false);
  const rerunBaseEvaluationIdRef = useRef<string | null>(null);

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

      return isInProgressStatus(status) ? EVALUATION_REFETCH_INTERVAL : false;
    },
  });

  const status = evaluation?.status;

  const isInProgress = isInProgressStatus(status);
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';
  const progressPercent = getSafeProgressPercent(evaluation?.progressPercent);

  useEffect(() => {
    const evaluationId = evaluation?.evaluationId;

    if (
      isWaitingRerunCompletionRef.current &&
      status === 'completed' &&
      evaluationId &&
      evaluationId !== rerunBaseEvaluationIdRef.current
    ) {
      showToast('성능 평가가 완료되었어요', 'success');
      isWaitingRerunCompletionRef.current = false;
    }

    if (isWaitingRerunCompletionRef.current && status === 'failed') {
      isWaitingRerunCompletionRef.current = false;
    }
  }, [evaluation?.evaluationId, status, showToast]);

  const rerunMutation = useMutation({
    mutationFn: rerunModelEvaluation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: aiModelQueryKeys.latestEvaluation(),
      });

      await queryClient.invalidateQueries({
        queryKey: aiModelQueryKeys.latestModelInfo(),
      });

      await queryClient.refetchQueries({
        queryKey: aiModelQueryKeys.latestEvaluation(),
      });
    },
  });

  const handleRerun = async () => {
    if (rerunMutation.isPending || isInProgress) {
      return;
    }

    const version = latestModelInfo?.modelVersion;
    const datasetVersion = latestModelInfo?.datasetVersion;

    if (!version || !datasetVersion) {
      showToast('평가할 모델 정보가 없어요', 'error');
      return;
    }

    rerunBaseEvaluationIdRef.current = evaluation?.evaluationId ?? null;
    rerunMutation.reset();
    isWaitingRerunCompletionRef.current = true;

    try {
      await rerunMutation.mutateAsync({
        version,
        datasetVersion,
      });
    } catch {
      isWaitingRerunCompletionRef.current = false;
    }
  };

  return {
    evaluation: isCompleted ? evaluation : null,
    status,
    progressPercent,
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
