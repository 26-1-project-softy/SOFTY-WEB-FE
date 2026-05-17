import { isAxiosError } from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { threadDetailApi } from '@/services/teacher/threadDetailApi';
import { formatChatMessageDateTime } from '@/utils/formatDateTime';
import {
  getInquiryIntentByType,
  INQUIRY_INTENT,
  type InquiryIntentType,
} from '@/constants/inquiryIntent';
import { INQUIRY_STATUS } from '@/constants/inquiryStatus';
import { useThreadStatusStore, type ThreadStatus } from '@/stores/threadStatusStore';
import { getThreadDetailErrorMessage, toAnalysisResult } from '@/features/teacher/threadDetail/lib';
import { useChatMessagesQuery } from '@/features/teacher/threadDetail/queries';
import { useReadChatRoom, useSendTeacherMessage } from '@/features/teacher/threadDetail/mutations';
import type {
  AnalysisResult,
  DetailLoadState,
  MessageItem,
  SendTeacherMessageRequest,
} from '@/features/teacher/threadDetail/types';

type UseTeacherThreadDetailParams = {
  chatRoomId: number;
};

type ComposerActionMode = 'send' | 'assist';

const FOCUS_REFRESH_THROTTLE_MS = 3000;

export const useThreadDetail = ({ chatRoomId }: UseTeacherThreadDetailParams) => {
  const [status, setStatus] = useState<ThreadStatus>(INQUIRY_STATUS.IN_PROGRESS);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisFeedbackScore, setAnalysisFeedbackScore] = useState<number | null>(null);
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [feedbackErrorMessage, setFeedbackErrorMessage] = useState('');
  const [analysisErrorMessage, setAnalysisErrorMessage] = useState('');
  const [sendErrorMessage, setSendErrorMessage] = useState('');
  const [lastAnalysisId, setLastAnalysisId] = useState<number | null>(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [isAnalysisRequesting, setIsAnalysisRequesting] = useState(false);
  const [loadState, setLoadState] = useState<DetailLoadState>('loading');
  const [detailErrorMessage, setDetailErrorMessage] = useState('');
  const [counterpartName, setCounterpartName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [intentType, setIntentType] = useState<InquiryIntentType>(INQUIRY_INTENT.ETC);

  const isAnalyzingRef = useRef(false);
  const isSendingRef = useRef(false);
  const isMarkingReadRef = useRef(false);
  const lastFocusedRefreshAtRef = useRef(0);

  const setRoomStatus = useThreadStatusStore(state => state.setRoomStatus);

  const isValidChatRoomId = Number.isFinite(chatRoomId) && chatRoomId > 0;

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

  const sendTeacherMessageMutation = useSendTeacherMessage();
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

  const loadChatRoomDetail = useCallback(
    async ({ shouldShowLoading = true }: { shouldShowLoading?: boolean } = {}) => {
      if (!isValidChatRoomId) {
        setLoadState('error');
        setDetailErrorMessage('대화 정보를 불러올 수 없어요');
        return;
      }

      try {
        if (shouldShowLoading) {
          setLoadState('loading');
        }

        setDetailErrorMessage('');

        const response = await threadDetailApi.getChatRoomDetail(chatRoomId);
        const payload = response.data;

        if (!payload) {
          throw new Error('채팅방 데이터가 없습니다.');
        }

        const nextIntentType = getInquiryIntentByType(payload.intentType);
        const overriddenStatus = useThreadStatusStore.getState().statusByRoomId[chatRoomId];
        const nextStatus = overriddenStatus ?? payload.status;

        setCounterpartName(payload.counterpartName ?? '');
        setStudentName(payload.studentName ?? '');
        setIntentType(nextIntentType);
        setStatus(nextStatus);

        if (!overriddenStatus) {
          setRoomStatus(chatRoomId, payload.status);
        }

        setLoadState('success');
      } catch {
        setLoadState('error');
        setDetailErrorMessage('대화 정보를 불러올 수 없어요');
      }
    },
    [chatRoomId, isValidChatRoomId, setRoomStatus]
  );

  useEffect(() => {
    void loadChatRoomDetail();
  }, [loadChatRoomDetail]);

  useEffect(() => {
    if (!isValidChatRoomId) {
      return;
    }

    const refreshMessagesOnFocus = () => {
      const now = Date.now();

      if (now - lastFocusedRefreshAtRef.current < FOCUS_REFRESH_THROTTLE_MS) {
        return;
      }

      lastFocusedRefreshAtRef.current = now;

      void refetchMessages();
      void markMessagesAsRead();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshMessagesOnFocus();
      }
    };

    window.addEventListener('focus', refreshMessagesOnFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', refreshMessagesOnFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isValidChatRoomId, markMessagesAsRead, refetchMessages]);

  useEffect(() => {
    void markMessagesAsRead();
  }, [chatRoomId, markMessagesAsRead]);

  useEffect(() => {
    setAnalysisResult(null);
    setLastAnalysisId(null);
    setAnalysisFeedbackScore(null);
    setFeedbackSaved(false);
    setFeedbackErrorMessage('');
    setAnalysisErrorMessage('');
    setSendErrorMessage('');
    setMessageInput('');
  }, [chatRoomId]);

  const hasMessageInput = messageInput.trim().length > 0;
  const composerActionMode: ComposerActionMode = analysisResult ? 'send' : 'assist';
  const isComposerActionDisabled = !hasMessageInput || isAnalysisRequesting;
  const isUnsafeRisk =
    analysisResult?.riskLevel === 'UNSAFE' || analysisResult?.riskLevel === 'HIGH';

  const resetComposerState = () => {
    setMessageInput('');
    setAnalysisResult(null);
    setLastAnalysisId(null);
    setAnalysisFeedbackScore(null);
    setFeedbackSaved(false);
    setFeedbackErrorMessage('');
    setSendErrorMessage('');
  };

  const requestMessageAnalysis = useCallback(async () => {
    if (!hasMessageInput || isAnalysisRequesting || isAnalyzingRef.current) {
      return null;
    }

    try {
      isAnalyzingRef.current = true;
      setIsAnalysisRequesting(true);
      setAnalysisErrorMessage('');
      setSendErrorMessage('');
      setAnalysisResult(null);

      if (!isValidChatRoomId) {
        throw new Error('유효하지 않은 채팅방입니다.');
      }

      const content = messageInput.trim();

      const response = lastAnalysisId
        ? await threadDetailApi.recheckMessage(lastAnalysisId, content)
        : await threadDetailApi.analyzeMessage(chatRoomId, content);

      const nextAnalysisResult = toAnalysisResult(response);

      setAnalysisResult(nextAnalysisResult);
      setLastAnalysisId(nextAnalysisResult.analysisId);
      setAnalysisFeedbackScore(null);
      setFeedbackSaved(false);
      setFeedbackErrorMessage('');

      return nextAnalysisResult;
    } catch (error) {
      setAnalysisErrorMessage(getThreadDetailErrorMessage(error, '메시지 분석에 실패했어요'));
      return null;
    } finally {
      isAnalyzingRef.current = false;
      setIsAnalysisRequesting(false);
    }
  }, [
    chatRoomId,
    hasMessageInput,
    isAnalysisRequesting,
    isValidChatRoomId,
    lastAnalysisId,
    messageInput,
  ]);

  const sendTeacherMessage = useCallback(async () => {
    if (!hasMessageInput || isAnalysisRequesting || isSendingRef.current) {
      return;
    }

    try {
      isSendingRef.current = true;
      setIsAnalysisRequesting(true);
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
    } finally {
      isSendingRef.current = false;
      setIsAnalysisRequesting(false);
    }
  }, [
    analysisResult?.analysisId,
    appendOptimisticMessage,
    chatRoomId,
    hasMessageInput,
    isAnalysisRequesting,
    markMessagesAsRead,
    messageInput,
    refetchMessages,
    sendTeacherMessageMutation,
  ]);

  const handleComposerActionClick = () => {
    if (composerActionMode === 'assist') {
      void requestMessageAnalysis();
      return;
    }

    void sendTeacherMessage();
  };

  const handleMessageInputChange = (nextValue: string) => {
    setMessageInput(nextValue);

    if (analysisResult) {
      setAnalysisResult(null);
    }

    if (sendErrorMessage) {
      setSendErrorMessage('');
    }

    if (analysisErrorMessage) {
      setAnalysisErrorMessage('');
    }
  };

  const handleRetryAnalysis = () => {
    void requestMessageAnalysis();
  };

  const handleApplyRecommendedReply = async () => {
    if (!analysisResult?.recommendedReply) {
      return;
    }

    try {
      const response = await threadDetailApi.saveRecommendationAdoption(analysisResult.analysisId);

      if (!response.success) {
        throw new Error(response.message || '추천문장 채택 저장에 실패했어요');
      }
    } catch {
      // 채택 저장 실패하더라도 추천문장 적용 UX는 유지합니다.
    }

    setMessageInput(analysisResult.recommendedReply);
    setAnalysisResult(null);
    setAnalysisFeedbackScore(null);
    setFeedbackSaved(false);
    setFeedbackErrorMessage('');
    setAnalysisErrorMessage('');
    setSendErrorMessage('');
  };

  const handleAnalysisFeedbackClick = async (score: number) => {
    if (!analysisResult || isFeedbackSubmitting) {
      return;
    }

    try {
      setIsFeedbackSubmitting(true);
      setAnalysisFeedbackScore(score);
      setFeedbackErrorMessage('');

      const response = await threadDetailApi.saveAnalysisFeedback(analysisResult.analysisId, score);

      if (!response.success) {
        throw new Error(response.message || '피드백 저장에 실패했어요');
      }

      setFeedbackSaved(true);
    } catch {
      setFeedbackSaved(false);
      setFeedbackErrorMessage('피드백을 저장하지 못했어요');
    } finally {
      setIsFeedbackSubmitting(false);
    }
  };

  const handleRetryFeedback = () => {
    if (analysisFeedbackScore == null) {
      return;
    }

    void handleAnalysisFeedbackClick(analysisFeedbackScore);
  };

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
    await loadChatRoomDetail();
    await refetchMessages();
    await markMessagesAsRead();
  };

  const handleSelectStatus = async (nextStatus: ThreadStatus) => {
    if (isStatusUpdating) {
      return;
    }

    const previousStatus = status;

    setStatus(nextStatus);
    setRoomStatus(chatRoomId, nextStatus);
    setIsStatusMenuOpen(false);

    if (!isValidChatRoomId) {
      return;
    }

    try {
      setIsStatusUpdating(true);

      const response = await threadDetailApi.updateStatus(chatRoomId, nextStatus);

      if (!response.success) {
        throw new Error(response.message || '처리 상태 변경에 실패했어요');
      }
    } catch {
      setStatus(previousStatus);
      setRoomStatus(chatRoomId, previousStatus);
    } finally {
      setIsStatusUpdating(false);
    }
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
