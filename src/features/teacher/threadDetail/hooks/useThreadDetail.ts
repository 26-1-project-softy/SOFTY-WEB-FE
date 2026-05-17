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
import {
  getThreadDetailErrorMessage,
  toAnalysisResult,
  toMessageItem,
} from '@/features/teacher/threadDetail/lib';
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

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messagesError, setMessagesError] = useState('');
  const [messagesPartialError, setMessagesPartialError] = useState('');
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isMessagesLoadingMore, setIsMessagesLoadingMore] = useState(false);
  const [messagesNextCursor, setMessagesNextCursor] = useState<number | null>(null);
  const [messagesHasNext, setMessagesHasNext] = useState(false);

  const isAnalyzingRef = useRef(false);
  const isSendingRef = useRef(false);

  const setRoomStatus = useThreadStatusStore(state => state.setRoomStatus);
  const statusByRoomId = useThreadStatusStore(state => state.statusByRoomId);

  const isValidChatRoomId = Number.isFinite(chatRoomId) && chatRoomId > 0;

  const markMessagesAsRead = useCallback(async () => {
    if (!isValidChatRoomId) {
      return;
    }

    try {
      await threadDetailApi.readRoom(chatRoomId);
    } catch {
      // 읽음 처리는 부가 동작이므로 실패해도 화면 흐름은 유지합니다.
    }
  }, [chatRoomId, isValidChatRoomId]);

  const loadChatRoomDetail = useCallback(async () => {
    if (!isValidChatRoomId) {
      setLoadState('error');
      setDetailErrorMessage('대화 정보를 불러올 수 없어요');
      return;
    }

    try {
      setLoadState('loading');
      setDetailErrorMessage('');

      const response = await threadDetailApi.getChatRoomDetail(chatRoomId);
      const payload = response.data;

      if (!payload) {
        throw new Error('채팅방 데이터가 없습니다.');
      }

      const nextIntentType = getInquiryIntentByType(payload.intentType);
      const overriddenStatus = statusByRoomId[chatRoomId];
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
  }, [chatRoomId, isValidChatRoomId, setRoomStatus, statusByRoomId]);

  const loadMessages = useCallback(
    async ({ cursor, append }: { cursor?: number; append?: boolean } = {}) => {
      if (!isValidChatRoomId) {
        return;
      }

      try {
        if (append) {
          setIsMessagesLoadingMore(true);
        } else {
          setIsMessagesLoading(true);
          setMessagesError('');
        }

        const response = await threadDetailApi.getMessages(chatRoomId, {
          cursor,
          size: 20,
        });

        const payload = response.data;

        if (!payload) {
          throw new Error('메시지 데이터가 없습니다.');
        }

        const mappedMessages = payload.messages.map(toMessageItem);

        setMessages(prev => (append ? [...prev, ...mappedMessages] : mappedMessages));
        setMessagesNextCursor(payload.nextCursor);
        setMessagesHasNext(payload.hasNext);
        setMessagesPartialError('');
      } catch {
        if (append) {
          setMessagesPartialError('채팅 내역 일부를 불러오지 못했어요.');
        } else {
          setMessages([]);
          setMessagesError('메시지를 불러올 수 없어요.');
          setMessagesPartialError('');
        }
      } finally {
        setIsMessagesLoading(false);
        setIsMessagesLoadingMore(false);
      }
    },
    [chatRoomId, isValidChatRoomId]
  );

  useEffect(() => {
    void loadChatRoomDetail();
    void loadMessages();
    void markMessagesAsRead();
  }, [loadChatRoomDetail, loadMessages, markMessagesAsRead]);

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

      const response = await threadDetailApi.sendMessage(chatRoomId, payload);

      if (!response.success) {
        throw new Error(response.message || '메시지 전송에 실패했어요');
      }

      const createdAt = new Date().toISOString();
      const messageId = response.data?.messageId ?? Date.now();

      setMessages(prev => [
        ...prev,
        {
          id: messageId,
          senderName: '나',
          sentAt: formatChatMessageDateTime(createdAt),
          content,
          isMine: true,
          isUnreadByCounterpart: true,
        },
      ]);

      setMessageInput('');
      setAnalysisResult(null);
      setLastAnalysisId(null);
      setAnalysisFeedbackScore(null);
      setFeedbackSaved(false);
      setFeedbackErrorMessage('');
      setSendErrorMessage('');

      void markMessagesAsRead();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400) {
        try {
          const content = messageInput.trim();
          const response = await threadDetailApi.getMessages(chatRoomId, { size: 5 });
          const latestMine = response.data?.messages?.find(message => message.isMine);
          const isActuallySent = latestMine?.content?.trim() === content;

          if (isActuallySent) {
            setSendErrorMessage('');
            setMessageInput('');
            setAnalysisResult(null);
            setLastAnalysisId(null);
            setAnalysisFeedbackScore(null);
            setFeedbackSaved(false);
            setFeedbackErrorMessage('');
            await loadMessages();
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
    chatRoomId,
    hasMessageInput,
    isAnalysisRequesting,
    loadMessages,
    markMessagesAsRead,
    messageInput,
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
    if (!messagesHasNext || messagesNextCursor == null || isMessagesLoadingMore) {
      return;
    }

    void loadMessages({ cursor: messagesNextCursor, append: true });
  };

  const handleRetryMissingMessages = () => {
    if (!messagesHasNext || messagesNextCursor == null || isMessagesLoadingMore) {
      return;
    }

    void loadMessages({ cursor: messagesNextCursor, append: true });
  };

  const handleRetryConversation = async () => {
    await loadChatRoomDetail();
    await loadMessages();
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
