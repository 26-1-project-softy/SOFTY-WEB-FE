import { isAxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { threadDetailApi } from '@/services/teacher/threadDetailApi';
import { formatChatMessageDateTime } from '@/utils/formatDateTime';
import { getThreadDetailErrorMessage, toAnalysisResult } from '@/features/teacher/threadDetail/lib';
import {
  useAnalyzeTeacherMessage,
  useRecheckTeacherMessage,
  useSaveRecommendationAdoption,
  useSendTeacherMessage,
} from '@/features/teacher/threadDetail/mutations';
import type {
  AnalysisResult,
  MessageItem,
  SendTeacherMessageRequest,
} from '@/features/teacher/threadDetail/types';

type ComposerActionMode = 'send' | 'assist';

type RefetchMessagesResult = {
  isSuccess: boolean;
};

type UseThreadComposerParams = {
  chatRoomId: number;
  isValidChatRoomId: boolean;
  refetchMessages: () => Promise<RefetchMessagesResult>;
  appendOptimisticMessage: (message: MessageItem) => void;
  markMessagesAsRead: () => Promise<void>;
  resetFeedbackState: () => void;
  onAnalysisResultChange: (analysisResult: AnalysisResult | null) => void;
};

export const useThreadComposer = ({
  chatRoomId,
  isValidChatRoomId,
  refetchMessages,
  appendOptimisticMessage,
  markMessagesAsRead,
  resetFeedbackState,
  onAnalysisResultChange,
}: UseThreadComposerParams) => {
  const [messageInput, setMessageInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisErrorMessage, setAnalysisErrorMessage] = useState('');
  const [sendErrorMessage, setSendErrorMessage] = useState('');
  const [lastAnalysisId, setLastAnalysisId] = useState<number | null>(null);

  const analyzeTeacherMessageMutation = useAnalyzeTeacherMessage();
  const recheckTeacherMessageMutation = useRecheckTeacherMessage();
  const sendTeacherMessageMutation = useSendTeacherMessage();
  const saveRecommendationAdoptionMutation = useSaveRecommendationAdoption();

  const isAnalysisRequesting =
    analyzeTeacherMessageMutation.isPending || recheckTeacherMessageMutation.isPending;

  const isSendingMessage = sendTeacherMessageMutation.isPending;

  const hasMessageInput = messageInput.trim().length > 0;
  const composerActionMode: ComposerActionMode = analysisResult ? 'send' : 'assist';
  const isComposerActionDisabled = !hasMessageInput || isAnalysisRequesting || isSendingMessage;
  const isUnsafeRisk = analysisResult?.riskLevel === 'UNSAFE';

  const resetComposerState = useCallback(() => {
    setMessageInput('');
    setAnalysisResult(null);
    setLastAnalysisId(null);
    setAnalysisErrorMessage('');
    setSendErrorMessage('');

    onAnalysisResultChange(null);
    resetFeedbackState();
  }, [onAnalysisResultChange, resetFeedbackState]);

  const resetComposerForRoom = useCallback(() => {
    resetComposerState();
  }, [resetComposerState]);

  const requestMessageAnalysis = useCallback(async () => {
    if (!hasMessageInput || isAnalysisRequesting || isSendingMessage) {
      return null;
    }

    try {
      setAnalysisErrorMessage('');
      setSendErrorMessage('');
      setAnalysisResult(null);
      onAnalysisResultChange(null);

      if (!isValidChatRoomId) {
        throw new Error('유효하지 않은 채팅방입니다.');
      }

      const content = messageInput.trim();

      const response = lastAnalysisId
        ? await recheckTeacherMessageMutation.mutateAsync({
            analysisId: lastAnalysisId,
            content,
          })
        : await analyzeTeacherMessageMutation.mutateAsync({
            chatRoomId,
            content,
          });

      const nextAnalysisResult = toAnalysisResult(response);

      setAnalysisResult(nextAnalysisResult);
      setLastAnalysisId(nextAnalysisResult.analysisId);
      onAnalysisResultChange(nextAnalysisResult);
      resetFeedbackState();

      return nextAnalysisResult;
    } catch (error) {
      setAnalysisErrorMessage(getThreadDetailErrorMessage(error, '메시지 분석에 실패했어요'));
      return null;
    }
  }, [
    analyzeTeacherMessageMutation,
    chatRoomId,
    hasMessageInput,
    isAnalysisRequesting,
    isSendingMessage,
    isValidChatRoomId,
    lastAnalysisId,
    messageInput,
    onAnalysisResultChange,
    recheckTeacherMessageMutation,
    resetFeedbackState,
  ]);

  const sendTeacherMessage = useCallback(async () => {
    if (!hasMessageInput || isAnalysisRequesting || isSendingMessage) {
      return;
    }

    try {
      setAnalysisErrorMessage('');

      const content = messageInput.trim();

      if (!analysisResult?.analysisId) {
        throw new Error('분석 결과가 없어 메시지를 전송할 수 없어요');
      }

      const payload: SendTeacherMessageRequest = {
        analysisId: analysisResult.analysisId,
        content,
      };

      const response = await sendTeacherMessageMutation.mutateAsync({
        chatRoomId,
        payload,
      });

      if (!response.success) {
        throw new Error(response.message || '메시지 전송에 실패했어요');
      }

      const optimisticMessage: MessageItem = {
        id: response.data?.messageId ?? Date.now(),
        senderName: '나',
        sentAt: formatChatMessageDateTime(new Date().toISOString()),
        content,
        isMine: true,
        isUnreadByCounterpart: true,
      };

      resetComposerState();

      const refetchResult = await refetchMessages();

      if (!refetchResult.isSuccess) {
        appendOptimisticMessage(optimisticMessage);
      }

      void markMessagesAsRead();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400) {
        try {
          const content = messageInput.trim();
          const response = await threadDetailApi.getMessages(chatRoomId, { size: 5 });
          const latestMine = response.data?.messages?.find(message => message.isMine);
          const isActuallySent = latestMine?.content?.trim() === content;

          if (isActuallySent) {
            resetComposerState();

            const refetchResult = await refetchMessages();

            if (!refetchResult.isSuccess) {
              appendOptimisticMessage({
                id: latestMine?.messageId ?? Date.now(),
                senderName: '나',
                sentAt: formatChatMessageDateTime(
                  latestMine?.createdAt ?? new Date().toISOString()
                ),
                content,
                isMine: true,
                isUnreadByCounterpart: latestMine?.isUnreadByCounterpart ?? true,
              });
            }

            void markMessagesAsRead();
            return;
          }
        } catch {
          // 재확인 실패 시 일반 오류 처리로 진행합니다.
        }
      }

      setSendErrorMessage(getThreadDetailErrorMessage(error, '메시지를 전송하지 못했어요'));
    }
  }, [
    analysisResult?.analysisId,
    appendOptimisticMessage,
    chatRoomId,
    hasMessageInput,
    isAnalysisRequesting,
    isSendingMessage,
    markMessagesAsRead,
    messageInput,
    refetchMessages,
    resetComposerState,
    sendTeacherMessageMutation,
  ]);

  const handleComposerActionClick = useCallback(() => {
    if (composerActionMode === 'assist') {
      void requestMessageAnalysis();
      return;
    }

    void sendTeacherMessage();
  }, [composerActionMode, requestMessageAnalysis, sendTeacherMessage]);

  const handleMessageInputChange = useCallback(
    (nextValue: string) => {
      setMessageInput(nextValue);

      if (analysisResult) {
        setAnalysisResult(null);
        onAnalysisResultChange(null);
        resetFeedbackState();
      }

      if (sendErrorMessage) {
        setSendErrorMessage('');
      }

      if (analysisErrorMessage) {
        setAnalysisErrorMessage('');
      }
    },
    [
      analysisErrorMessage,
      analysisResult,
      onAnalysisResultChange,
      resetFeedbackState,
      sendErrorMessage,
    ]
  );

  const handleRetryAnalysis = useCallback(() => {
    void requestMessageAnalysis();
  }, [requestMessageAnalysis]);

  const handleApplyRecommendedReply = useCallback(async () => {
    if (!analysisResult?.recommendedMessage) {
      return;
    }

    try {
      const response = await saveRecommendationAdoptionMutation.mutateAsync(
        analysisResult.analysisId
      );

      if (!response.success) {
        throw new Error(response.message || '추천문장 채택 저장에 실패했어요');
      }
    } catch {
      // 채택 저장 실패하더라도 추천문장 적용 UX는 유지합니다.
    }

    setMessageInput(analysisResult.recommendedMessage);
    setAnalysisResult(null);
    setAnalysisErrorMessage('');
    setSendErrorMessage('');

    onAnalysisResultChange(null);
    resetFeedbackState();
  }, [
    analysisResult,
    onAnalysisResultChange,
    resetFeedbackState,
    saveRecommendationAdoptionMutation,
  ]);

  return {
    messageInput,
    analysisResult,
    analysisErrorMessage,
    sendErrorMessage,
    isAnalysisRequesting,
    isSendingMessage,
    composerActionMode,
    isComposerActionDisabled,
    isUnsafeRisk,
    resetComposerForRoom,
    handleMessageInputChange,
    handleComposerActionClick,
    handleRetryAnalysis,
    handleApplyRecommendedReply,
  };
};
