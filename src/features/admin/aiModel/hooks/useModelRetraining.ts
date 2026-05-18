import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { latestModelInfoQueryOptions } from '@/features/admin/aiModel/queries/modelInfo';
import { latestEvaluationQueryOptions } from '@/features/admin/aiModel/queries/modelEvaluation';
import { retrainModel } from '@/features/admin/aiModel/mutations/modelRetraining';
import { trainingJobQueryOptions } from '@/features/admin/aiModel/queries/modelRetraining';
import { aiModelQueryKeys } from '@/features/admin/aiModel/constants/aiModelQueryKeys';
import { PERFORMANCE_DEGRADATION_THRESHOLD } from '@/features/admin/aiModel/constants/modelEvaluation';
import {
  isRetrainingCompletedStatus,
  isRetrainingFailedStatus,
  isRetrainingPausedStatus,
  isRetrainingProgressStatus,
} from '@/features/admin/aiModel/lib/modelTrainingStatus';

const RETRAINING_REFETCH_INTERVAL = 2000;

const getSafeProgressPercent = (progressPercent?: number | null) => {
  if (typeof progressPercent !== 'number' || !Number.isFinite(progressPercent)) {
    return 0;
  }

  return Math.min(100, Math.max(0, progressPercent));
};

export const useModelRetraining = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [retrainingJobId, setRetrainingJobId] = useState<string | null>(null);

  const notifiedCompletedJobIdRef = useRef<string | null>(null);
  const notifiedFailedJobIdRef = useRef<string | null>(null);

  const {
    data: latestModelInfo,
    isLoading: isModelInfoLoading,
    isError: isModelInfoError,
  } = useQuery(latestModelInfoQueryOptions());

  const {
    data: latestEvaluation,
    isLoading: isEvaluationLoading,
    isError: isEvaluationError,
  } = useQuery(latestEvaluationQueryOptions());

  const { data: retrainingJob, isError: isRetrainingJobError } = useQuery({
    ...trainingJobQueryOptions(retrainingJobId ?? ''),
    enabled: Boolean(retrainingJobId),
    refetchInterval: query => {
      const status = query.state.data?.status;

      return isRetrainingProgressStatus(status) ? RETRAINING_REFETCH_INTERVAL : false;
    },
  });

  const retrainingStatus = retrainingJob?.status;
  const progressPercent = getSafeProgressPercent(retrainingJob?.progressPercent);

  const isWaitingRetrainingJob =
    Boolean(retrainingJobId) && !retrainingJob && !isRetrainingJobError;

  const isRetrainingInProgress =
    isWaitingRetrainingJob || isRetrainingProgressStatus(retrainingStatus);

  const isRetrainingPaused = isRetrainingPausedStatus(retrainingStatus);
  const isRetrainingFailed = isRetrainingFailedStatus(retrainingStatus) || isRetrainingJobError;
  const isRetrainingCompleted = isRetrainingCompletedStatus(retrainingStatus);

  const isPerformanceDegraded =
    latestEvaluation?.status === 'completed' &&
    latestEvaluation.f1Score < PERFORMANCE_DEGRADATION_THRESHOLD;

  useEffect(() => {
    if (!retrainingJobId || !isRetrainingCompleted) {
      return;
    }

    if (notifiedCompletedJobIdRef.current === retrainingJobId) {
      return;
    }

    notifiedCompletedJobIdRef.current = retrainingJobId;
    notifiedFailedJobIdRef.current = null;

    showToast('모델 재학습이 완료되었어요', 'success');

    void queryClient.invalidateQueries({
      queryKey: aiModelQueryKeys.latestModelInfo(),
    });

    void queryClient.invalidateQueries({
      queryKey: aiModelQueryKeys.latestEvaluation(),
    });

    void queryClient.invalidateQueries({
      queryKey: aiModelQueryKeys.trainingHistory(1, 20),
    });
  }, [isRetrainingCompleted, queryClient, retrainingJobId, showToast]);

  useEffect(() => {
    if (!retrainingJobId || !isRetrainingFailed) {
      return;
    }

    if (notifiedFailedJobIdRef.current === retrainingJobId) {
      return;
    }

    notifiedFailedJobIdRef.current = retrainingJobId;
    showToast('모델 재학습에 실패했어요', 'error');
  }, [isRetrainingFailed, retrainingJobId, showToast]);

  const retrainMutation = useMutation({
    mutationFn: retrainModel,
    onSuccess: response => {
      const nextJobId = response.jobId;

      if (!nextJobId) {
        showToast('재학습 작업 정보를 확인할 수 없어요', 'error');
        return;
      }

      notifiedCompletedJobIdRef.current = null;
      notifiedFailedJobIdRef.current = null;

      setRetrainingJobId(nextJobId);

      if (isRetrainingProgressStatus(response.status)) {
        showToast('모델 재학습을 시작했어요', 'success');
      } else if (isRetrainingCompletedStatus(response.status)) {
        showToast('최근 재학습이 이미 완료되었어요', 'success');
      } else if (isRetrainingFailedStatus(response.status)) {
        showToast('최근 재학습이 실패 상태예요', 'error');
      }

      void queryClient.invalidateQueries({
        queryKey: aiModelQueryKeys.trainingJob(nextJobId),
      });
    },
    onError: () => {
      showToast('모델 재학습 요청에 실패했어요', 'error');
    },
  });

  const handleRetrain = () => {
    if (retrainMutation.isPending || isRetrainingInProgress) {
      return;
    }

    retrainMutation.reset();
    retrainMutation.mutate();
  };

  return {
    latestModelInfo,
    latestEvaluation,
    retrainingJob,
    progressPercent,

    isLoading: isModelInfoLoading || isEvaluationLoading,
    isError: isModelInfoError || isEvaluationError,

    isRetraining: retrainMutation.isPending || isRetrainingInProgress,
    isRetrainingInProgress,
    isRetrainingPaused,
    isRetrainingFailed,
    isPerformanceDegraded,

    retrainError: retrainMutation.isError,
    handleRetrain,
  };
};
