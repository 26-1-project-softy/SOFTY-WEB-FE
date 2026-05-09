import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate, useParams } from 'react-router-dom';
import { InlineButton } from '@/components/common/InlineButton';
import { ROUTES } from '@/constants/routes';
import { apiClient } from '@/services/http/apiClient';
import { useChatRead } from '@/features/chat/hooks/useChatRead';
import {
  mapApiStatusToThreadStatus,
  useThreadStatusStore,
  type ThreadStatus,
} from '@/stores/threadStatusStore';
import { IcError, IcSparkles } from '@/icons';
import { ChatHeader } from '@/pages/teacher/threadDetail/components/ChatHeader';
import { ChatInput } from '@/pages/teacher/threadDetail/components/ChatInput';
import { ChatMessageList } from '@/pages/teacher/threadDetail/components/ChatMessageList';

type DetailLoadState = 'loading' | 'error' | 'success';
type AnalysisRiskLevel = 'LOW' | 'HIGH';

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

type AnalysisResult = {
  targetMessageId: number;
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

export const TeacherThreadDetailPage = () => {
  const navigate = useNavigate();
  const { threadId } = useParams();
  const [status, setStatus] = useState<ThreadStatus>('processing');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [analysisResult] = useState<AnalysisResult | null>(null);
  const [analysisErrorMessage, setAnalysisErrorMessage] = useState('');
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

  const statusInfo = useMemo(() => {
    if (status === 'processing') {
      return {
        label: '처리중',
        tone: 'processing' as const,
      };
    }

    if (status === 'hold') {
      return {
        label: '보류',
        tone: 'hold' as const,
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

  const requestMessageAnalysis = useCallback(async () => {
    if (!hasMessageInput || isAnalysisRequesting || analysisResult) {
      return;
    }

    try {
      setIsAnalysisRequesting(true);
      setAnalysisErrorMessage('');

      return;
    } catch {
      setAnalysisErrorMessage('메시지 분석에 실패했어요');
    } finally {
      setIsAnalysisRequesting(false);
    }
  }, [analysisResult, hasMessageInput, isAnalysisRequesting]);

  const handleComposerActionClick = () => {
    void requestMessageAnalysis();
  };

  const handleMessageInputChange = (nextValue: string) => {
    setMessageInput(nextValue);
    if (analysisErrorMessage) {
      setAnalysisErrorMessage('');
    }
  };

  const handleRetryAnalysis = () => {
    void requestMessageAnalysis();
  };

  const handleApplyRecommendedReply = () => {
    if (!analysisResult?.recommendedReply) {
      return;
    }

    setMessageInput(analysisResult.recommendedReply);
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

  const handleSelectStatus = (nextStatus: ThreadStatus) => {
    setStatus(nextStatus);
    setRoomStatus(chatRoomId, nextStatus);
    setIsStatusMenuOpen(false);
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
          />
        </ConversationPanel>

        <AssistantPanel>
          <AssistantHeader>
            <IcSparkles />
            <span>AI 소통 어시스턴트</span>
          </AssistantHeader>

          {!analysisResult && !analysisErrorMessage ? (
            <AssistantEmpty>
              <IcSparkles />
              <AssistantEmptyTitle>아직 분석할 메시지가 없어요</AssistantEmptyTitle>
              <AssistantEmptyText>
                메시지를 작성하면 분쟁 가능성을 살펴보고, 필요한 경우 더 부드러운 답장을 추천드려요.
              </AssistantEmptyText>
            </AssistantEmpty>
          ) : null}

          {!analysisResult && analysisErrorMessage ? (
            <AnalysisResultSection>
              <AnalysisTitle>AI 분쟁 가능성 분석</AnalysisTitle>
              <AnalysisErrorBanner role="alert">
                <AnalysisErrorLeft>
                  <AnalysisErrorIcon>
                    <IcError />
                  </AnalysisErrorIcon>
                  <AnalysisErrorTextWrap>
                    <AnalysisErrorTitle>{analysisErrorMessage}</AnalysisErrorTitle>
                    <AnalysisErrorDesc>잠시 후 다시 시도해 주세요.</AnalysisErrorDesc>
                  </AnalysisErrorTextWrap>
                </AnalysisErrorLeft>
                <InlineButton
                  variant="text"
                  size="M"
                  label={isAnalysisRequesting ? '요청 중...' : '다시 시도'}
                  onClick={handleRetryAnalysis}
                  disabled={isAnalysisRequesting}
                />
              </AnalysisErrorBanner>
            </AnalysisResultSection>
          ) : null}

          {analysisResult ? (
            <AnalysisResultSection>
              <AnalysisTitle>AI 분쟁 가능성 분석</AnalysisTitle>

              {analysisResult.riskLevel === 'HIGH' ? (
                <LowRiskCard $risk="high">
                  <LowRiskTitle $risk="high">오해가 발생할 수 있는 메시지예요</LowRiskTitle>
                  <LowRiskDescription>{analysisResult.summary}</LowRiskDescription>
                </LowRiskCard>
              ) : (
                <LowRiskCard $risk="low">
                  <LowRiskTitle $risk="low">문제 없는 메시지예요</LowRiskTitle>
                  <LowRiskDescription>{analysisResult.summary}</LowRiskDescription>
                </LowRiskCard>
              )}

              {analysisResult.riskLevel === 'HIGH' && analysisResult.recommendedReply ? (
                <RecommendSection>
                  <RecommendTitle>AI 추천 답변</RecommendTitle>
                  <RecommendCard>{analysisResult.recommendedReply}</RecommendCard>
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

const AnalysisResultSection = styled.div`
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AnalysisErrorBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid ${({ theme }) => theme.colors.semantic.error};
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.background.bg1};
  padding: 12px;

  button {
    flex-shrink: 0;
    white-space: nowrap;
  }
`;

const AnalysisErrorLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const AnalysisErrorIcon = styled.span`
  color: ${({ theme }) => theme.colors.semantic.error};
  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const AnalysisErrorTextWrap = styled.div`
  min-width: 0;
`;

const AnalysisErrorTitle = styled.p`
  ${({ theme }) => theme.fonts.labelS};
  margin: 0;
  color: ${({ theme }) => theme.colors.semantic.error};
`;

const AnalysisErrorDesc = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 2px 0 0;
  color: ${({ theme }) => theme.colors.semantic.error};
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
