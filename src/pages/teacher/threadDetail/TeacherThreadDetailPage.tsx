import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { isAxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { InlineButton } from '@/components/common/InlineButton';
import { Alert } from '@/components/common/Alert';
import { ROUTES } from '@/constants/routes';
import { apiClient } from '@/services/http/apiClient';
import { useChatRead } from '@/features/teacher/threadDetail/hooks/useChatRead';
import {
  mapApiStatusToThreadStatus,
  useThreadStatusStore,
  type ThreadStatus,
} from '@/stores/threadStatusStore';
import { IcInfo, IcSparkles } from '@/icons';
import { ChatHeader } from '@/pages/teacher/threadDetail/components/ChatHeader';
import { ChatInput } from '@/pages/teacher/threadDetail/components/ChatInput';
import { ChatMessageList } from '@/pages/teacher/threadDetail/components/ChatMessageList';

type DetailLoadState = 'loading' | 'error' | 'success';
type AnalysisRiskLevel = 'SAFE' | 'UNSAFE' | 'LOW' | 'HIGH';

type ChatRoomDetailData = {
  chatRoomId: number;
  counterpartName: string;
  studentName: string;
  intentLabel?: string;
  intentLavel?: string;
  status: string;
};

type ChatRoomDetailResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: ChatRoomDetailData | null;
};

type ChatRoomMessageResponse = {
  messageId: number;
  isMine: boolean;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
  unreadCount?: number;
};

type ChatRoomMessagesApiResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: {
    chatRoomId: number;
    messages: ChatRoomMessageResponse[];
    nextCursor: number | null;
    hasNext: boolean;
  } | null;
};

type AnalyzeTeacherMessageResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: {
    analysisId: number;
    riskLevel: AnalysisRiskLevel;
    recommendedMessage: string;
  } | null;
};

type RecheckTeacherMessageResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: {
    analysisId: number;
    riskLevel: AnalysisRiskLevel;
    recommendedMessage: string | null;
  } | null;
};

type SendTeacherMessageResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: {
    messageId: number;
    roomId: number;
  } | null;
};

type SendTeacherMessageRequest = {
  analysisId: number;
  content: string;
};

type AnalysisFeedbackResponse = {
  success: boolean;
  code: number;
  message: string;
};

type RecommendationAdoptionResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: null;
};

type UpdateChatRoomStatusResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: {
    chatRoomId: number;
    status: string;
  } | null;
};

type AnalysisResult = {
  analysisId: number;
  riskLevel: AnalysisRiskLevel;
  summary: string;
  recommendedReply?: string | null;
};

type MessageItem = {
  id: number;
  senderName: string;
  sentAt: string;
  content: string;
  isMine: boolean;
  unreadCount?: number;
};

const formatMessageTime = (value: string) => {
  if (!value) return '-';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const year = parsed.getFullYear();
  const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
  const day = `${parsed.getDate()}`.padStart(2, '0');
  const hour24 = parsed.getHours();
  const minute = `${parsed.getMinutes()}`.padStart(2, '0');
  const period = hour24 >= 12 ? '오후' : '오전';
  const hour12 = hour24 % 12 || 12;

  return `${year}-${month}-${day} ${period} ${hour12}:${minute}`;
};

const toMessageItem = (message: ChatRoomMessageResponse): MessageItem => {
  return {
    id: message.messageId,
    senderName: message.senderName || '-',
    sentAt: formatMessageTime(message.createdAt),
    content: message.content || '-',
    isMine: message.isMine,
    unreadCount: message.unreadCount ?? 0,
  };
};

const mapThreadStatusToApiStatus = (status: ThreadStatus) => {
  if (status === 'done') return 'COMPLETED';
  return 'IN_PROGRESS';
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as
      | { message?: string; error?: string; detail?: string }
      | string
      | undefined;

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    const messageFromBody =
      (typeof data === 'object' && data?.message) ||
      (typeof data === 'object' && data?.error) ||
      (typeof data === 'object' && data?.detail);

    if (messageFromBody && messageFromBody.trim()) {
      return messageFromBody;
    }

    if (status === 400) {
      return '요청 형식이 올바르지 않아요. analysisId와 content 값을 확인해 주세요.';
    }
    if (status === 401) {
      return '로그인이 만료되었어요. 다시 로그인해 주세요.';
    }
    if (status === 403) {
      return '이 채팅방에 메시지를 전송할 권한이 없어요.';
    }
    if (status === 404) {
      return '채팅방 또는 분석 결과를 찾을 수 없어요.';
    }

    return `${fallback} (HTTP ${status ?? '알 수 없음'})`;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

export const TeacherThreadDetailPage = () => {
  const navigate = useNavigate();
  const { threadId } = useParams();
  const [status, setStatus] = useState<ThreadStatus>('processing');
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
  const [intentLabel, setIntentLabel] = useState('');

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messagesError, setMessagesError] = useState('');
  const [messagesPartialError, setMessagesPartialError] = useState('');
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isMessagesLoadingMore, setIsMessagesLoadingMore] = useState(false);
  const [messagesNextCursor, setMessagesNextCursor] = useState<number | null>(null);
  const [messagesHasNext, setMessagesHasNext] = useState(false);
  const isAnalyzingRef = useRef(false);
  const isSendingRef = useRef(false);

  const chatRoomId = useMemo(() => Number(threadId), [threadId]);
  const { markAsRead } = useChatRead(chatRoomId);
  const setRoomStatus = useThreadStatusStore(state => state.setRoomStatus);
  const statusByRoomId = useThreadStatusStore(state => state.statusByRoomId);

  const markMessagesAsRead = useCallback(async () => {
    try {
      const isSuccess = await markAsRead();
      if (isSuccess) {
        setMessages(prev =>
          prev.map(message => (message.isMine ? { ...message, unreadCount: 0 } : message))
        );
      }
    } catch {
      // 읽음 처리는 부가 동작이므로, 실패해도 화면 흐름은 유지합니다.
    }
  }, [markAsRead]);

  const loadChatRoomDetail = useCallback(async () => {
    if (!Number.isFinite(chatRoomId) || chatRoomId <= 0) {
      setLoadState('error');
      setDetailErrorMessage('대화 정보를 불러올 수 없어요');
      return;
    }

    try {
      setLoadState('loading');
      setDetailErrorMessage('');

      const { data } = await apiClient.get<ChatRoomDetailResponse>(`/chat-rooms/${chatRoomId}`);
      const payload = data.data;

      if (!payload) {
        throw new Error('채팅방 데이터가 없습니다.');
      }

      setCounterpartName(payload.counterpartName ?? '');
      setStudentName(payload.studentName ?? '');
      setIntentLabel(payload.intentLabel || payload.intentLavel || '');
      const mappedStatus = mapApiStatusToThreadStatus(payload.status);
      const overriddenStatus = statusByRoomId[chatRoomId];
      const nextStatus = overriddenStatus ?? mappedStatus;
      setStatus(nextStatus);
      if (!overriddenStatus) {
        setRoomStatus(chatRoomId, mappedStatus);
      }
      setLoadState('success');
    } catch {
      setLoadState('error');
      setDetailErrorMessage('대화 정보를 불러올 수 없어요');
    }
  }, [chatRoomId, setRoomStatus, statusByRoomId]);

  const loadMessages = useCallback(
    async ({ cursor, append }: { cursor?: number; append?: boolean } = {}) => {
      if (!Number.isFinite(chatRoomId) || chatRoomId <= 0) {
        return;
      }

      try {
        if (append) {
          setIsMessagesLoadingMore(true);
        } else {
          setIsMessagesLoading(true);
          setMessagesError('');
        }

        const { data } = await apiClient.get<ChatRoomMessagesApiResponse>(
          `/chat-rooms/${chatRoomId}/messages`,
          {
            params: {
              size: 20,
              ...(cursor != null ? { cursor } : {}),
            },
          }
        );

        const payload = data.data;
        if (!payload) {
          throw new Error('메시지 데이터가 없습니다.');
        }

        const mapped = payload.messages.map(toMessageItem);

        setMessages(prev => (append ? [...prev, ...mapped] : mapped));
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
    [chatRoomId]
  );

  useEffect(() => {
    void loadChatRoomDetail();
    void loadMessages();
    void markMessagesAsRead();
  }, [loadChatRoomDetail, loadMessages, markMessagesAsRead]);

  useEffect(() => {
    // 채팅방이 바뀌면 이전 방의 분석 컨텍스트를 제거합니다.
    setAnalysisResult(null);
    setLastAnalysisId(null);
    setAnalysisFeedbackScore(null);
    setFeedbackSaved(false);
    setFeedbackErrorMessage('');
    setAnalysisErrorMessage('');
    setSendErrorMessage('');
    setMessageInput('');
  }, [chatRoomId]);

  const statusInfo = useMemo(() => {
    if (status === 'processing') {
      return {
        label: '처리중',
        tone: 'processing' as const,
      };
    }

    return {
      label: '완료',
      tone: 'done' as const,
    };
  }, [status]);

  const hasMessageInput = messageInput.trim().length > 0;
  const composerActionMode = analysisResult ? 'send' : 'assist';
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

      if (!Number.isFinite(chatRoomId) || chatRoomId <= 0) {
        throw new Error('유효하지 않은 채팅방입니다.');
      }

      const content = messageInput.trim();
      const { data } = lastAnalysisId
        ? await apiClient.post<RecheckTeacherMessageResponse>(
            `/teacher-message-analyses/${lastAnalysisId}/recheck`,
            {
              content,
            }
          )
        : await apiClient.post<AnalyzeTeacherMessageResponse>(
            `/chat-rooms/${chatRoomId}/teacher-messages/analyze`,
            {
              content,
            }
          );

      if (!data.success || !data.data) {
        throw new Error(data.message || '메시지 분석에 실패했어요');
      }

      const nextAnalysisResult: AnalysisResult = {
        analysisId: data.data.analysisId,
        riskLevel: data.data.riskLevel,
        summary: data.message || '메시지 분석이 완료되었습니다.',
        recommendedReply: data.data.recommendedMessage?.trim() || null,
      };
      setAnalysisResult(nextAnalysisResult);
      setLastAnalysisId(nextAnalysisResult.analysisId);
      setAnalysisFeedbackScore(null);
      setFeedbackSaved(false);
      setFeedbackErrorMessage('');

      return nextAnalysisResult;
    } catch (error) {
      setAnalysisErrorMessage(getApiErrorMessage(error, '메시지 분석에 실패했어요'));
      return null;
    } finally {
      isAnalyzingRef.current = false;
      setIsAnalysisRequesting(false);
    }
  }, [chatRoomId, hasMessageInput, isAnalysisRequesting, lastAnalysisId, messageInput]);

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
      console.log('[TeacherThreadDetailPage] sendTeacherMessage payload', {
        chatRoomId,
        analysisId: payload.analysisId,
        content: payload.content,
      });
      const { data } = await apiClient.post<SendTeacherMessageResponse>(
        `/chat-rooms/${chatRoomId}/teacher-messages`,
        payload
      );
      if (!data.success) throw new Error(data.message || '메시지 전송에 실패했어요');

      const createdAt = new Date().toISOString();
      const messageId = data.data?.messageId ?? Date.now();

      setMessages(prev => [
        ...prev,
        {
          id: messageId,
          senderName: '나',
          sentAt: formatMessageTime(createdAt),
          content,
          isMine: true,
          unreadCount: 1,
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
      // 백엔드가 저장은 성공했지만 4xx를 반환하는 경우를 보정합니다.
      if (isAxiosError(error) && error.response?.status === 400) {
        try {
          const content = messageInput.trim();
          const { data } = await apiClient.get<ChatRoomMessagesApiResponse>(
            `/chat-rooms/${chatRoomId}/messages`,
            {
              params: { size: 5 },
            }
          );
          const latestMine = data.data?.messages?.find(message => message.isMine);
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

      setSendErrorMessage(getApiErrorMessage(error, '메시지를 전송하지 못했어요'));
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
      const { data } = await apiClient.post<RecommendationAdoptionResponse>(
        `/teacher-message-analyses/${analysisResult.analysisId}/recommendation-adoption`,
        {
          analysisId: analysisResult.analysisId,
        }
      );

      if (!data.success) {
        throw new Error(data.message || '추천문장 채택 저장에 실패했어요');
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

      const { data } = await apiClient.put<AnalysisFeedbackResponse>(
        `/teacher-message-analyses/${analysisResult.analysisId}/feedback`,
        {
          score,
        }
      );

      if (!data.success) {
        throw new Error(data.message || '피드백 저장에 실패했어요');
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

    if (!Number.isFinite(chatRoomId) || chatRoomId <= 0) {
      return;
    }

    try {
      setIsStatusUpdating(true);
      const { data } = await apiClient.patch<UpdateChatRoomStatusResponse>(
        `/chat-rooms/${chatRoomId}/status`,
        {
          status: mapThreadStatusToApiStatus(nextStatus),
        }
      );

      if (!data.success) {
        throw new Error(data.message || '처리 상태 변경에 실패했어요');
      }
    } catch {
      setStatus(previousStatus);
      setRoomStatus(chatRoomId, previousStatus);
    } finally {
      setIsStatusUpdating(false);
    }
  };

  return (
    <ThreadDetailPageContainer>
      <ChatHeader
        counterpartName={counterpartName}
        studentName={studentName}
        intentLabel={intentLabel}
        statusLabel={statusInfo.label}
        statusTone={statusInfo.tone}
        isStatusMenuOpen={isStatusMenuOpen}
        onBack={() => navigate(ROUTES.teacherThreadList)}
        onToggleStatusMenu={() => setIsStatusMenuOpen(prev => !prev)}
        onSelectStatus={handleSelectStatus}
      />

      <ThreadBody>
        <ConversationPanel>
          <ChatMessageList
            loadState={loadState}
            detailErrorMessage={detailErrorMessage}
            isMessagesLoading={isMessagesLoading}
            messagesError={messagesError}
            messagesPartialError={messagesPartialError}
            messagesHasNext={messagesHasNext}
            isMessagesLoadingMore={isMessagesLoadingMore}
            messages={messages}
            onRetryConversation={() => void handleRetryConversation()}
            onRetryMissingMessages={handleRetryMissingMessages}
            onLoadMoreMessages={handleLoadMoreMessages}
          />

          <ChatInput
            value={messageInput}
            onChange={handleMessageInputChange}
            actionMode={composerActionMode}
            isActionDisabled={isComposerActionDisabled}
            onActionClick={handleComposerActionClick}
            errorMessage={sendErrorMessage}
          />
        </ConversationPanel>

        <AssistantPanel>
          <AssistantHeader>
            <IcSparkles />
            <span>AI 소통 어시스턴트</span>
          </AssistantHeader>

          {isAnalysisRequesting ? (
            <AssistantAnalyzing>
              <AnalyzingDots aria-hidden>
                <span />
                <span />
                <span />
              </AnalyzingDots>
              <AssistantAnalyzingTitle>메시지를 살펴보고 있어요</AssistantAnalyzingTitle>
              <AssistantAnalyzingText>
                표현의 톤과 오해 소지를 점검하고 있어요.
              </AssistantAnalyzingText>
            </AssistantAnalyzing>
          ) : null}

          {!isAnalysisRequesting && !analysisResult && !analysisErrorMessage ? (
            <AssistantEmpty>
              <IcSparkles />
              <AssistantEmptyTitle>아직 분석할 메시지가 없어요</AssistantEmptyTitle>
              <AssistantEmptyText>
                메시지를 작성하면 분쟁 가능성을 살펴보고, 필요한 경우 더 부드러운 답장을 추천드려요.
              </AssistantEmptyText>
            </AssistantEmpty>
          ) : null}

          {!isAnalysisRequesting && !analysisResult && analysisErrorMessage ? (
            <AnalysisResultSection>
              <AnalysisTitle>AI 분쟁 가능성 분석</AnalysisTitle>
              <Alert
                title={analysisErrorMessage}
                description="잠시 후 다시 시도해 주세요."
                variant="error"
                onRetry={isAnalysisRequesting ? undefined : handleRetryAnalysis}
              />
            </AnalysisResultSection>
          ) : null}

          {!isAnalysisRequesting && analysisResult ? (
            <AnalysisResultSection>
              <AnalysisTitle>AI 분쟁 가능성 분석</AnalysisTitle>

              {isUnsafeRisk ? (
                <>
                  <LowRiskCard $risk="high">
                    <LowRiskTitle $risk="high">오해가 발생할 수 있는 메시지예요</LowRiskTitle>
                    <LowRiskDescription>{analysisResult.summary}</LowRiskDescription>
                  </LowRiskCard>

                  <FeedbackSection>
                    <FeedbackQuestion>분쟁 가능성 분석 결과가 얼마나 적절했나요?</FeedbackQuestion>
                    <FeedbackScale>
                      {[1, 2, 3, 4, 5].map(score => (
                        <FeedbackScoreButton
                          key={score}
                          type="button"
                          $selected={analysisFeedbackScore === score}
                          onClick={() => void handleAnalysisFeedbackClick(score)}
                          aria-pressed={analysisFeedbackScore === score}
                          disabled={isFeedbackSubmitting}
                        >
                          {score}
                        </FeedbackScoreButton>
                      ))}
                    </FeedbackScale>
                    <FeedbackLabels>
                      <span>매우 부적절</span>
                      <span>매우 적절</span>
                    </FeedbackLabels>
                    {analysisFeedbackScore != null && feedbackSaved ? (
                      <FeedbackAppliedBox role="status" aria-live="polite">
                        <FeedbackAppliedIcon>
                          <IcInfo />
                        </FeedbackAppliedIcon>
                        <FeedbackAppliedTextWrap>
                          <FeedbackAppliedTitle>의견이 반영되었어요</FeedbackAppliedTitle>
                          <FeedbackAppliedDescription>
                            보내주신 피드백은 분석 품질 개선에 활용돼요.
                          </FeedbackAppliedDescription>
                        </FeedbackAppliedTextWrap>
                      </FeedbackAppliedBox>
                    ) : null}
                    {analysisFeedbackScore != null && !feedbackSaved && feedbackErrorMessage ? (
                      <Alert
                        title={feedbackErrorMessage}
                        description="잠시 후 다시 시도해 주세요."
                        variant="error"
                        onRetry={isFeedbackSubmitting ? undefined : handleRetryFeedback}
                      />
                    ) : null}
                  </FeedbackSection>
                </>
              ) : (
                <>
                  <LowRiskCard $risk="low">
                    <LowRiskTitle $risk="low">문제 없는 메시지예요</LowRiskTitle>
                    <LowRiskDescription>{analysisResult.summary}</LowRiskDescription>
                  </LowRiskCard>

                  <FeedbackSection>
                    <FeedbackQuestion>분쟁 가능성 분석 결과가 얼마나 적절했나요?</FeedbackQuestion>
                    <FeedbackScale>
                      {[1, 2, 3, 4, 5].map(score => (
                        <FeedbackScoreButton
                          key={score}
                          type="button"
                          $selected={analysisFeedbackScore === score}
                          onClick={() => void handleAnalysisFeedbackClick(score)}
                          aria-pressed={analysisFeedbackScore === score}
                          disabled={isFeedbackSubmitting}
                        >
                          {score}
                        </FeedbackScoreButton>
                      ))}
                    </FeedbackScale>
                    <FeedbackLabels>
                      <span>매우 부적절</span>
                      <span>매우 적절</span>
                    </FeedbackLabels>
                    {analysisFeedbackScore != null && feedbackSaved ? (
                      <FeedbackAppliedBox role="status" aria-live="polite">
                        <FeedbackAppliedIcon>
                          <IcInfo />
                        </FeedbackAppliedIcon>
                        <FeedbackAppliedTextWrap>
                          <FeedbackAppliedTitle>의견이 반영되었어요</FeedbackAppliedTitle>
                          <FeedbackAppliedDescription>
                            보내주신 피드백은 분석 품질 개선에 활용돼요.
                          </FeedbackAppliedDescription>
                        </FeedbackAppliedTextWrap>
                      </FeedbackAppliedBox>
                    ) : null}
                    {analysisFeedbackScore != null && !feedbackSaved && feedbackErrorMessage ? (
                      <Alert
                        title={feedbackErrorMessage}
                        description="잠시 후 다시 시도해 주세요."
                        variant="error"
                        onRetry={isFeedbackSubmitting ? undefined : handleRetryFeedback}
                      />
                    ) : null}
                  </FeedbackSection>
                </>
              )}

              {isUnsafeRisk ? (
                <RecommendSection>
                  <RecommendTitle>AI 추천 답변</RecommendTitle>
                  <RecommendCard>
                    {analysisResult.recommendedReply ||
                      '학부모님, 안내해주신 내용을 바탕으로 확인 후 정확하게 다시 안내드리겠습니다.'}
                  </RecommendCard>
                  <RecommendApplyButton
                    variant="ghost"
                    size="M"
                    width="100%"
                    label="적용하기"
                    onClick={handleApplyRecommendedReply}
                  />
                </RecommendSection>
              ) : null}
            </AnalysisResultSection>
          ) : null}
        </AssistantPanel>
      </ThreadBody>
    </ThreadDetailPageContainer>
  );
};

const ThreadDetailPageContainer = styled.section`
  height: 100%;
  background: ${({ theme }) => theme.colors.background.bg2};
  border-top: 1px solid ${({ theme }) => theme.colors.border.border1};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ThreadBody = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
`;

const ConversationPanel = styled.section`
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${({ theme }) => theme.colors.border.border1};
  overflow: hidden;
`;

const AssistantPanel = styled.aside`
  width: clamp(360px, 28vw, 440px);
  min-width: 360px;
  min-height: 0;
  background: ${({ theme }) => theme.colors.background.bg1};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const AssistantHeader = styled.header`
  ${({ theme }) => theme.fonts.labelM};
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.brand.dark};
  padding: 16px 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.border1};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const AssistantEmpty = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
  padding: 20px;
  color: ${({ theme }) => theme.colors.text.text4};

  svg {
    width: 20px;
    height: 20px;
  }
`;

const AssistantEmptyTitle = styled.p`
  ${({ theme }) => theme.fonts.labelS};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const AssistantEmptyText = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text4};
`;

const AssistantAnalyzing = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;
  padding: 20px;
`;

const AnalyzingDots = styled.div`
  display: inline-flex;
  gap: 8px;

  span {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.brand.primary};
    opacity: 0.35;
    animation: dotBlink 1.1s infinite ease-in-out;
  }

  span:nth-of-type(2) {
    animation-delay: 0.15s;
  }

  span:nth-of-type(3) {
    animation-delay: 0.3s;
  }

  @keyframes dotBlink {
    0%,
    80%,
    100% {
      transform: translateY(0);
      opacity: 0.35;
    }
    40% {
      transform: translateY(-3px);
      opacity: 1;
    }
  }
`;

const AssistantAnalyzingTitle = styled.p`
  ${({ theme }) => theme.fonts.titleS};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const AssistantAnalyzingText = styled.p`
  ${({ theme }) => theme.fonts.body2};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const AnalysisResultSection = styled.div`
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AnalysisTitle = styled.h4`
  ${({ theme }) => theme.fonts.labelS};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const LowRiskCard = styled.div<{ $risk: 'low' | 'high' }>`
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  border-radius: 12px;
  background: ${({ $risk, theme }) =>
    $risk === 'high' ? theme.colors.semantic.errorSoft : theme.colors.semantic.successSoft};
  border-color: ${({ $risk, theme }) =>
    $risk === 'high' ? theme.colors.semantic.error : theme.colors.border.border1};
  padding: 12px;
`;

const LowRiskTitle = styled.p<{ $risk: 'low' | 'high' }>`
  ${({ theme }) => theme.fonts.labelXS};
  margin: 0;
  color: ${({ $risk, theme }) =>
    $risk === 'high' ? theme.colors.semantic.error : theme.colors.semantic.success};
`;

const LowRiskDescription = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.text.text2};
`;

const RecommendSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RecommendTitle = styled.h5`
  ${({ theme }) => theme.fonts.labelS};
  margin: 2px 0 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const RecommendCard = styled.div`
  ${({ theme }) => theme.fonts.body3};
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.background.bg1};
  color: ${({ theme }) => theme.colors.text.text2};
  padding: 12px;
  line-height: 1.45;
`;

const RecommendApplyButton = styled(InlineButton)``;

const FeedbackSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FeedbackQuestion = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const FeedbackScale = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
`;

const FeedbackScoreButton = styled.button<{ $selected: boolean }>`
  ${({ theme }) => theme.fonts.labelXS};
  height: 30px;
  border-radius: 8px;
  border: 1px solid
    ${({ theme, $selected }) =>
      $selected ? theme.colors.brand.primary : theme.colors.border.border1};
  background: ${({ theme, $selected }) =>
    $selected ? theme.colors.brand.primary : theme.colors.background.bg1};
  color: ${({ theme, $selected }) =>
    $selected ? theme.colors.text.textW : theme.colors.text.text2};
  cursor: pointer;
`;

const FeedbackLabels = styled.div`
  ${({ theme }) => theme.fonts.caption};
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.text.text4};
`;

const FeedbackAppliedBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid ${({ theme }) => theme.colors.brand.primary};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.background.bg4};
  padding: 10px 12px;
`;

const FeedbackAppliedIcon = styled.span`
  display: inline-flex;
  color: ${({ theme }) => theme.colors.brand.primary};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const FeedbackAppliedTextWrap = styled.div`
  min-width: 0;
`;

const FeedbackAppliedTitle = styled.p`
  ${({ theme }) => theme.fonts.labelXS};
  margin: 0;
  color: ${({ theme }) => theme.colors.brand.primary};
`;

const FeedbackAppliedDescription = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 2px 0 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;
