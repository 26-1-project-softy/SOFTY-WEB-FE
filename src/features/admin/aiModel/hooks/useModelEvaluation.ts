import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/useToast';
import { aiModelApi } from '@/services/admin/aiModelApi';
import type { Evaluation, EvaluationResponse } from '@/features/admin/aiModel/types/evaluation';

export const useModelEvaluation = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const prevStatusRef = useRef<Evaluation['status'] | null>(null);
  const isRerunTriggeredRef = useRef(false);

  const { data, isLoading, isError } = useQuery<EvaluationResponse>({
    queryKey: ['modelEvaluation'],
    queryFn: aiModelApi.getLatestEvaluation,

    refetchInterval: query => {
      const status = query.state.data?.data?.status;
      return status === 'queued' || status === 'running' ? 3000 : false;
    },
  });

  const evaluation: Evaluation | null = data?.data ?? null;
  const status = evaluation?.status;

  const isInProgress = status === 'queued' || status === 'running';
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
    mutationFn: aiModelApi.rerunEvaluation,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['modelEvaluation'],
        exact: true,
      });
    },
  });

  const handleRerun = async () => {
    if (rerunMutation.isPending || isInProgress) return;

    const version = evaluation?.version;
    if (!version) {
      showToast('평가할 모델 버전 정보가 없어요', 'error');
      return;
    }

    rerunMutation.reset();
    isRerunTriggeredRef.current = true;

    try {
      await rerunMutation.mutateAsync({
        version,
        datasetVersion: 'v1.0',
      });
    } catch {
      showToast('재평가 요청에 실패했어요', 'error');
    }
  };

  return {
    evaluation: isCompleted ? evaluation : null,
    status,
    isInProgress,
    isCompleted,
    isFailed,
    isLoading,
    isError,

    onRerun: handleRerun,

    isRerunning: rerunMutation.isPending || isInProgress,

    rerunError: rerunMutation.isError,
    resetRerunError: rerunMutation.reset,
  };
};
