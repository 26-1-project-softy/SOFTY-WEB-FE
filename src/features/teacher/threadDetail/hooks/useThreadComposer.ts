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

type RefetchMessages = () => Promise<{
  isSuccess: boolean;
}>;

type UseThreadComposerParams = {
  chatRoomId: number;
  isValidChatRoomId: boolean;
  refetchMessages: RefetchMessages;
  appendOptimisticMessage: (message: MessageItem) => void;
  markMessagesAsRead: () => Promise<void>;
  resetFeedbackState: () => void;
  onAnalysisResultChange: (analysisResult: AnalysisResult | null) => void;
  onRequestScrollToLatestMessage: () => void;
};

export const useThreadComposer = ({
  chatRoomId,
  isValidChatRoomId,
  refetchMessages,
  appendOptimisticMessage,
  markMessagesAsRead,
  resetFeedbackState,
  onAnalysisResultChange,
  onRequestScrollToLatestMessage,
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
    analyzeTeacherMessageMutation.isPending ||
    recheckTeacherMessageMutation.isPending ||
    sendTeacherMessageMutation.isPending;

  const isSendingMessage = sendTeacherMessageMutation.isPending;

  // 공백만 있는 메시지는 막되, 실제 전송 content는 원문 그대로 사용한다.
  const hasMessageInput = messageInput.trim().length > 0;

  const composerActionMode: ComposerActionMode = analysisResult ? 'send' : 'assist';
  const isComposerActionDisabled = !hasMessageInput || isAnalysisRequesting;
  const isUnsafeRisk = analysisResult?.riskLevel === 'UNSAFE';
  const analysisId = analysisResult?.analysisId;
  const recommendedMessage = analysisResult?.recommendedMessage;

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
    if (!hasMessageInput || isAnalysisRequesting) {
      return null;
    }

    try {
      setAnalysisErrorMessage('');
      setSendErrorMessage('');
      setAnalysisResult(null);
      onAnalysisResultChange(null);

      if (!isValidChatRoomId) {
        setAnalysisErrorMessage('유효하지 않은 채팅방입니다.');
        return null;
      }

      const content = messageInput;

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
    isValidChatRoomId,
    lastAnalysisId,
    messageInput,
    onAnalysisResultChange,
    recheckTeacherMessageMutation,
    resetFeedbackState,
  ]);

  const appendFallbackMineMessage = useCallback(
    (message: MessageItem) => {
      appendOptimisticMessage(message);
      onRequestScrollToLatestMessage();
    },
    [appendOptimisticMessage, onRequestScrollToLatestMessage]
  );

  const refreshMessagesAfterSend = useCallback(
    async (fallbackMessage: MessageItem) => {
      const refetchResult = await refetchMessages();

      if (!refetchResult.isSuccess) {
        appendFallbackMineMessage(fallbackMessage);
        return;
      }

      onRequestScrollToLatestMessage();
    },
    [appendFallbackMineMessage, onRequestScrollToLatestMessage, refetchMessages]
  );

  const sendTeacherMessage = useCallback(async () => {
    if (!hasMessageInput || isAnalysisRequesting) {
      return;
    }

    try {
      setAnalysisErrorMessage('');
      setSendErrorMessage('');

      const content = messageInput;

      if (!analysisId) {
        setSendErrorMessage('분석 결과가 없어 메시지를 전송할 수 없어요');
        return;
      }

      const payload: SendTeacherMessageRequest = {
        analysisId,
        content,
      };

      const response = await sendTeacherMessageMutation.mutateAsync({
        chatRoomId,
        payload,
      });

      if (!response.success) {
        setSendErrorMessage(response.message || '메시지 전송에 실패했어요');
        return;
      }

      const fallbackMessage: MessageItem = {
        id: response.data?.messageId ?? Date.now(),
        senderName: '나',
        sentAt: formatChatMessageDateTime(new Date().toISOString()),
        content,
        isMine: true,
        isUnreadByCounterpart: true,
      };

      resetComposerState();

      await refreshMessagesAfterSend(fallbackMessage);
      void markMessagesAsRead();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400) {
        try {
          const content = messageInput;
          const response = await threadDetailApi.getMessages(chatRoomId, { size: 5 });
          const latestMine = [...(response.data?.messages ?? [])]
            .reverse()
            .find(message => message.isMine);

          const isActuallySent = latestMine?.content === content;

          if (isActuallySent) {
            const fallbackMessage: MessageItem = {
              id: latestMine.messageId,
              senderName: '나',
              sentAt: formatChatMessageDateTime(latestMine.createdAt),
              content,
              isMine: true,
              isUnreadByCounterpart: latestMine.isUnreadByCounterpart,
            };

            resetComposerState();

            await refreshMessagesAfterSend(fallbackMessage);
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
    analysisId,
    chatRoomId,
    hasMessageInput,
    isAnalysisRequesting,
    markMessagesAsRead,
    messageInput,
    refreshMessagesAfterSend,
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
    if (!recommendedMessage || !analysisId) {
      return;
    }

    try {
      await saveRecommendationAdoptionMutation.mutateAsync(analysisId);
    } catch {
      // 채택 저장 실패하더라도 추천문장 적용 UX는 유지합니다.
    }

    setMessageInput(recommendedMessage);
    setAnalysisResult(null);
    setAnalysisErrorMessage('');
    setSendErrorMessage('');

    onAnalysisResultChange(null);
    resetFeedbackState();
  }, [
    analysisId,
    onAnalysisResultChange,
    recommendedMessage,
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
