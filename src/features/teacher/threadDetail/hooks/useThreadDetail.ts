import { useCallback, useEffect, useRef, useState } from 'react';
import { getInquiryIntentByType, type InquiryIntentType } from '@/constants/inquiryIntent';
import type { AnalysisResult, DetailLoadState } from '@/features/teacher/threadDetail/types';
import {
  useChatMessagesQuery,
  useChatRoomDetailQuery,
} from '@/features/teacher/threadDetail/queries';
import { useReadChatRoom } from '@/features/teacher/threadDetail/mutations';
import { useRefreshChatMessagesOnFocus } from '@/features/teacher/threadDetail/hooks/useRefreshChatMessagesOnFocus';
import { useThreadAnalysisFeedback } from '@/features/teacher/threadDetail/hooks/useThreadAnalysisFeedback';
import { useThreadComposer } from '@/features/teacher/threadDetail/hooks/useThreadComposer';
import { useThreadStatusControl } from '@/features/teacher/threadDetail/hooks/useThreadStatusControl';

type UseTeacherThreadDetailParams = {
  chatRoomId: number;
};

const FOCUS_REFRESH_THROTTLE_MS = 3000;

export const useThreadDetail = ({ chatRoomId }: UseTeacherThreadDetailParams) => {
  const [currentAnalysisResult, setCurrentAnalysisResult] = useState<AnalysisResult | null>(null);
  const isMarkingReadRef = useRef(false);

  const isValidChatRoomId = Number.isFinite(chatRoomId) && chatRoomId > 0;

  const chatRoomDetailQuery = useChatRoomDetailQuery(chatRoomId);
  const chatRoomDetail = chatRoomDetailQuery.data;

  const {
    messages,
    isMessagesLoading,
    isMessagesLoadingMore,
    messagesError,
    messagesPartialError,
    messagesHasNext,
    fetchNextMessagesPage,
    refetchMessages,
    appendOptimisticMessage,
  } = useChatMessagesQuery(chatRoomId);

  const { mutateAsync: readChatRoom } = useReadChatRoom(chatRoomId);

  const markMessagesAsRead = useCallback(async () => {
    if (!isValidChatRoomId || isMarkingReadRef.current) {
      return;
    }

    try {
      isMarkingReadRef.current = true;
      await readChatRoom();
    } catch {
      // 읽음 처리는 부가 동작이므로 실패해도 화면 흐름은 유지합니다.
    } finally {
      isMarkingReadRef.current = false;
    }
  }, [isValidChatRoomId, readChatRoom]);

  const refreshMessages = useCallback(() => {
    void refetchMessages();
    void markMessagesAsRead();
  }, [markMessagesAsRead, refetchMessages]);

  useRefreshChatMessagesOnFocus({
    enabled: isValidChatRoomId,
    throttleMs: FOCUS_REFRESH_THROTTLE_MS,
    onRefresh: refreshMessages,
  });

  useEffect(() => {
    void markMessagesAsRead();
  }, [chatRoomId, markMessagesAsRead]);

  const { status, isStatusMenuOpen, isStatusUpdating, setIsStatusMenuOpen, handleSelectStatus } =
    useThreadStatusControl({
      chatRoomId,
      isValidChatRoomId,
      serverStatus: chatRoomDetail?.status,
    });

  const {
    analysisFeedbackScore,
    isFeedbackSubmitting,
    feedbackSaved,
    feedbackErrorMessage,
    resetFeedbackState,
    handleAnalysisFeedbackClick,
    handleRetryFeedback,
  } = useThreadAnalysisFeedback({
    analysisResult: currentAnalysisResult,
  });

  const {
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
  } = useThreadComposer({
    chatRoomId,
    isValidChatRoomId,
    refetchMessages,
    appendOptimisticMessage,
    markMessagesAsRead,
    resetFeedbackState,
    onAnalysisResultChange: setCurrentAnalysisResult,
  });

  useEffect(() => {
    resetComposerForRoom();
    resetFeedbackState();
    setCurrentAnalysisResult(null);
  }, [chatRoomId, resetComposerForRoom, resetFeedbackState]);

  const counterpartName = chatRoomDetail?.counterpartName ?? '';
  const studentName = chatRoomDetail?.studentName ?? '';
  const intentType: InquiryIntentType = getInquiryIntentByType(chatRoomDetail?.intentType);

  const loadState: DetailLoadState = !isValidChatRoomId
    ? 'error'
    : chatRoomDetailQuery.isLoading
      ? 'loading'
      : chatRoomDetailQuery.isError
        ? 'error'
        : 'success';

  const detailErrorMessage =
    !isValidChatRoomId || chatRoomDetailQuery.isError ? '대화 정보를 불러올 수 없어요' : '';

  const handleLoadMoreMessages = () => {
    if (!messagesHasNext || isMessagesLoadingMore) {
      return;
    }

    void fetchNextMessagesPage();
  };

  const handleRetryMissingMessages = () => {
    void refetchMessages();
  };

  const handleRetryConversation = async () => {
    await chatRoomDetailQuery.refetch();
    await refetchMessages();
    await markMessagesAsRead();
  };

  return {
    status,
    isStatusMenuOpen,
    messageInput,
    analysisResult,
    analysisFeedbackScore,
    isFeedbackSubmitting,
    feedbackSaved,
    feedbackErrorMessage,
    analysisErrorMessage,
    sendErrorMessage,
    isStatusUpdating,
    isAnalysisRequesting,
    isSendingMessage,
    loadState,
    detailErrorMessage,
    counterpartName,
    studentName,
    intentType,
    messages,
    messagesError,
    messagesPartialError,
    isMessagesLoading,
    isMessagesLoadingMore,
    messagesHasNext,
    composerActionMode,
    isComposerActionDisabled,
    isUnsafeRisk,

    setIsStatusMenuOpen,
    handleMessageInputChange,
    handleComposerActionClick,
    handleRetryAnalysis,
    handleApplyRecommendedReply,
    handleAnalysisFeedbackClick,
    handleRetryFeedback,
    handleLoadMoreMessages,
    handleRetryMissingMessages,
    handleRetryConversation,
    handleSelectStatus,
  };
};
