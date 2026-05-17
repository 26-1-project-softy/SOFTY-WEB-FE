import { useCallback, useState } from 'react';
import { useSaveAnalysisFeedback } from '@/features/teacher/threadDetail/mutations';
import type { AnalysisResult } from '@/features/teacher/threadDetail/types';

type UseThreadAnalysisFeedbackParams = {
  analysisResult: AnalysisResult | null;
};

export const useThreadAnalysisFeedback = ({ analysisResult }: UseThreadAnalysisFeedbackParams) => {
  const [analysisFeedbackScore, setAnalysisFeedbackScore] = useState<number | null>(null);
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [feedbackErrorMessage, setFeedbackErrorMessage] = useState('');

  const saveAnalysisFeedbackMutation = useSaveAnalysisFeedback();

  const resetFeedbackState = useCallback(() => {
    setAnalysisFeedbackScore(null);
    setFeedbackSaved(false);
    setFeedbackErrorMessage('');
  }, []);

  const handleAnalysisFeedbackClick = useCallback(
    async (score: number) => {
      if (!analysisResult || saveAnalysisFeedbackMutation.isPending) {
        return;
      }

      try {
        setAnalysisFeedbackScore(score);
        setFeedbackErrorMessage('');

        const response = await saveAnalysisFeedbackMutation.mutateAsync({
          analysisId: analysisResult.analysisId,
          score,
        });

        if (!response.success) {
          throw new Error(response.message || '피드백 저장에 실패했어요');
        }

        setFeedbackSaved(true);
      } catch {
        setFeedbackSaved(false);
        setFeedbackErrorMessage('피드백을 저장하지 못했어요');
      }
    },
    [analysisResult, saveAnalysisFeedbackMutation]
  );

  const handleRetryFeedback = useCallback(() => {
    if (analysisFeedbackScore == null) {
      return;
    }

    void handleAnalysisFeedbackClick(analysisFeedbackScore);
  }, [analysisFeedbackScore, handleAnalysisFeedbackClick]);

  return {
    analysisFeedbackScore,
    isFeedbackSubmitting: saveAnalysisFeedbackMutation.isPending,
    feedbackSaved,
    feedbackErrorMessage,
    resetFeedbackState,
    handleAnalysisFeedbackClick,
    handleRetryFeedback,
  };
};
