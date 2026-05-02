import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate, useParams } from 'react-router-dom';
import { IconButton } from '@/components/common/IconButton';
import { InlineButton } from '@/components/common/InlineButton';
import { ChatComposer } from '@/components/common/chat/ChatComposer';
import { StatusTagButton, type StatusTagTone } from '@/components/common/chat/StatusTagButton';
import { ROUTES } from '@/constants/routes';
import { apiClient } from '@/services/http/apiClient';
import { IcBack, IcSparkles } from '@/icons';

type ThreadStatus = 'processing' | 'done';
type DetailLoadState = 'loading' | 'error' | 'success';

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
  };
};

export const TeacherThreadDetailPage = () => {
  const navigate = useNavigate();
  const { threadId } = useParams();
  const [status, setStatus] = useState<ThreadStatus>('processing');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalysisResult, setHasAnalysisResult] = useState(false);
  const [loadState, setLoadState] = useState<DetailLoadState>('loading');
  const [detailErrorMessage, setDetailErrorMessage] = useState('');
  const [counterpartName, setCounterpartName] = useState('학부모');
  const [studentName, setStudentName] = useState('학생');
  const [intentLabel, setIntentLabel] = useState('미분류');

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messagesError, setMessagesError] = useState('');
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isMessagesLoadingMore, setIsMessagesLoadingMore] = useState(false);
  const [messagesNextCursor, setMessagesNextCursor] = useState<number | null>(null);
  const [messagesHasNext, setMessagesHasNext] = useState(false);

  const chatRoomId = useMemo(() => Number(threadId), [threadId]);

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
      } catch {
        if (!append) {
          setMessages([]);
          setMessagesError('메시지를 불러올 수 없어요.');
        }
      } finally {
        setIsMessagesLoading(false);
        setIsMessagesLoadingMore(false);
      }
    },
    [chatRoomId]
  );

  useEffect(() => {
    if (!Number.isFinite(chatRoomId) || chatRoomId <= 0) {
      setLoadState('error');
      setDetailErrorMessage('채팅방 정보를 불러올 수 없어요.');
      return;
    }

    const loadChatRoomDetail = async () => {
      try {
        setLoadState('loading');
        setDetailErrorMessage('');

        const { data } = await apiClient.get<ChatRoomDetailResponse>(`/chat-rooms/${chatRoomId}`);
        const payload = data.data;

        if (!payload) {
          throw new Error('채팅방 데이터가 없습니다.');
        }

        setCounterpartName(payload.counterpartName || '학부모');
        setStudentName(payload.studentName || '학생');
        setIntentLabel(payload.intentLabel || payload.intentLavel || '미분류');
        setStatus(payload.status === 'DONE' ? 'done' : 'processing');
        setLoadState('success');
      } catch {
        setLoadState('error');
        setDetailErrorMessage('채팅방 정보를 불러올 수 없어요.');
      }
    };

    void loadChatRoomDetail();
    void loadMessages();
  }, [chatRoomId, loadMessages]);

  const statusInfo = useMemo(() => {
    if (status === 'processing') {
      return {
        label: '처리중',
        tone: 'processing' as StatusTagTone,
      };
    }

    return {
      label: '완료',
      tone: 'done' as StatusTagTone,
    };
  }, [status]);

  const hasMessageInput = messageInput.trim().length > 0;
  const composerActionMode = hasAnalysisResult ? 'send' : 'assist';
  const isComposerActionDisabled = !hasMessageInput || isAnalyzing;

  const handleComposerActionClick = () => {
    if (!hasMessageInput || isAnalyzing) {
      return;
    }

    if (hasAnalysisResult) {
      return;
    }

    setIsAnalyzing(true);

    window.setTimeout(() => {
      setIsAnalyzing(false);
      setHasAnalysisResult(true);
    }, 1200);
  };

  const handleMessageInputChange = (nextValue: string) => {
    setMessageInput(nextValue);

    if (!nextValue.trim()) {
      setIsAnalyzing(false);
      setHasAnalysisResult(false);
    }
  };

  const handleLoadMoreMessages = () => {
    if (!messagesHasNext || messagesNextCursor == null || isMessagesLoadingMore) {
      return;
    }

    void loadMessages({ cursor: messagesNextCursor, append: true });
  };

  return (
    <ThreadDetailPageContainer>
      <ThreadHeader>
        <BackButtonWrap>
          <IconButton
            icon={IcBack}
            variant="plain"
            accessibilityLabel="수신함으로 이동"
            onClick={() => navigate(ROUTES.teacherThreadList)}
          />
        </BackButtonWrap>

        <HeaderInfo>
          <ParentName>{counterpartName}</ParentName>
          <StudentName>{studentName}</StudentName>
          <StatusTagButton label={intentLabel} tone="absence" />

          <StatusDropdownWrap>
            <StatusTagButton
              label={statusInfo.label}
              tone={statusInfo.tone}
              isDropdown
              onClick={() => setIsStatusMenuOpen(prev => !prev)}
            />

            {isStatusMenuOpen ? (
              <StatusMenu>
                <StatusMenuItem
                  type="button"
                  onClick={() => {
                    setStatus('processing');
                    setIsStatusMenuOpen(false);
                  }}
                >
                  처리중
                </StatusMenuItem>
                <StatusMenuItem
                  type="button"
                  onClick={() => {
                    setStatus('done');
                    setIsStatusMenuOpen(false);
                  }}
                >
                  완료
                </StatusMenuItem>
              </StatusMenu>
            ) : null}
          </StatusDropdownWrap>
        </HeaderInfo>
      </ThreadHeader>

      <ThreadBody>
        <ConversationPanel>
          {loadState === 'error' ? (
            <DetailErrorBox>{detailErrorMessage}</DetailErrorBox>
          ) : loadState === 'loading' ? (
            <DetailLoadingBox>채팅방 정보를 불러오는 중입니다.</DetailLoadingBox>
          ) : isMessagesLoading ? (
            <DetailLoadingBox>메시지를 불러오는 중입니다.</DetailLoadingBox>
          ) : messagesError ? (
            <DetailErrorBox>{messagesError}</DetailErrorBox>
          ) : (
            <MessageArea>
              {messagesHasNext ? (
                <LoadMoreWrap>
                  <InlineButton
                    variant="ghost"
                    size="M"
                    label={isMessagesLoadingMore ? '불러오는 중...' : '이전 메시지 더보기'}
                    onClick={handleLoadMoreMessages}
                    disabled={isMessagesLoadingMore}
                  />
                </LoadMoreWrap>
              ) : null}

              {messages.map(message => (
                <MessageRow key={message.id} $isMine={message.isMine}>
                  {!message.isMine ? (
                    <IncomingMeta>
                      <Avatar>{message.senderName.charAt(0)}</Avatar>
                      <IncomingInfo>
                        <SenderName>{message.senderName}</SenderName>
                        <MessageTime>{message.sentAt}</MessageTime>
                      </IncomingInfo>
                    </IncomingMeta>
                  ) : (
                    <OutgoingTime>{message.sentAt}</OutgoingTime>
                  )}

                  <BubbleWrap $isMine={message.isMine}>
                    <MessageBubble $isMine={message.isMine}>{message.content}</MessageBubble>
                    {message.isMine && message.unreadCount ? (
                      <UnreadMarker>{message.unreadCount}</UnreadMarker>
                    ) : null}
                  </BubbleWrap>
                </MessageRow>
              ))}
            </MessageArea>
          )}

          <ComposerWrap>
            <ChatComposer
              value={messageInput}
              onChange={handleMessageInputChange}
              actionMode={composerActionMode}
              isActionDisabled={isComposerActionDisabled}
              onActionClick={handleComposerActionClick}
            />
          </ComposerWrap>
        </ConversationPanel>

        <AssistantPanel>
          <AssistantHeader>
            <IcSparkles />
            <span>AI 소통 어시스턴트</span>
          </AssistantHeader>

          {!isAnalyzing && !hasAnalysisResult ? (
            <AssistantEmpty>
              <IcSparkles />
              <AssistantEmptyTitle>아직 분석할 메시지가 없어요</AssistantEmptyTitle>
              <AssistantEmptyText>
                메시지를 작성하면 분쟁 가능성을 살펴보고, 필요한 경우 더 부드러운 답장을 추천드려요.
              </AssistantEmptyText>
            </AssistantEmpty>
          ) : null}

          {isAnalyzing ? (
            <AssistantEmpty>
              <TypingDots>
                <span />
                <span />
                <span />
              </TypingDots>
              <AssistantEmptyTitle>메시지를 살펴보고 있어요</AssistantEmptyTitle>
              <AssistantEmptyText>표현의 톤과 오해 소지를 점검하고 있어요.</AssistantEmptyText>
            </AssistantEmpty>
          ) : null}

          {hasAnalysisResult && !isAnalyzing ? (
            <AssistantEmpty>
              <RiskChip>분쟁 가능성 낮음</RiskChip>
              <AssistantEmptyTitle>메시지를 분석했어요</AssistantEmptyTitle>
              <AssistantEmptyText>
                현재 문장은 부드럽고 명확해요. 전송 버튼으로 바로 보낼 수 있어요.
              </AssistantEmptyText>
            </AssistantEmpty>
          ) : null}
        </AssistantPanel>
      </ThreadBody>
    </ThreadDetailPageContainer>
  );
};

const ThreadDetailPageContainer = styled.section`
  min-height: calc(100vh - 72px);
  background: ${({ theme }) => theme.colors.background.bg2};
  border-top: 1px solid ${({ theme }) => theme.colors.border.border1};
  display: flex;
  flex-direction: column;
`;

const ThreadHeader = styled.header`
  height: 84px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.border1};
  background: ${({ theme }) => theme.colors.background.bg1};
`;

const BackButtonWrap = styled.div`
  button {
    width: 32px;
    height: 32px;
  }
`;

const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
`;

const ParentName = styled.h2`
  ${({ theme }) => theme.fonts.titleM};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const StudentName = styled.span`
  ${({ theme }) => theme.fonts.labelM};
  color: ${({ theme }) => theme.colors.text.text3};
`;

const StatusDropdownWrap = styled.div`
  position: relative;
`;

const StatusMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 92px;
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background.bg1};
  box-shadow: ${({ theme }) => theme.colors.shadow.card};
  overflow: hidden;
  z-index: 10;
`;

const StatusMenuItem = styled.button`
  ${({ theme }) => theme.fonts.body3};
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  color: ${({ theme }) => theme.colors.text.text2};

  &:hover {
    background: ${({ theme }) => theme.colors.background.bg4};
  }
`;

const ThreadBody = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
`;

const ConversationPanel = styled.section`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${({ theme }) => theme.colors.border.border1};
`;

const MessageArea = styled.div`
  flex: 1;
  background: #cdd8d4;
  padding: 16px 14px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const DetailErrorBox = styled.div`
  ${({ theme }) => theme.fonts.labelS};
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.semantic.error};
`;

const DetailLoadingBox = styled(DetailErrorBox)`
  color: ${({ theme }) => theme.colors.text.text3};
`;

const LoadMoreWrap = styled.div`
  align-self: center;
`;

const MessageRow = styled.article<{ $isMine: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isMine }) => ($isMine ? 'flex-end' : 'flex-start')};
  gap: 8px;
`;

const IncomingMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.span`
  ${({ theme }) => theme.fonts.labelXS};
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.background.bg4};
  color: ${({ theme }) => theme.colors.brand.dark};
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const IncomingInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SenderName = styled.span`
  ${({ theme }) => theme.fonts.labelXS};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const MessageTime = styled.span`
  ${({ theme }) => theme.fonts.caption};
  color: ${({ theme }) => theme.colors.text.text4};
`;

const OutgoingTime = styled(MessageTime)`
  margin-right: 4px;
`;

const BubbleWrap = styled.div<{ $isMine: boolean }>`
  position: relative;
  max-width: min(62%, 650px);
  ${({ $isMine }) => ($isMine ? 'margin-right: 0;' : '')}
`;

const MessageBubble = styled.div<{ $isMine: boolean }>`
  ${({ theme }) => theme.fonts.body2};
  border-radius: 16px;
  padding: 16px;
  line-height: 1.45;
  color: ${({ $isMine, theme }) => ($isMine ? theme.colors.text.textW : theme.colors.text.text2)};
  background: ${({ $isMine }) => ($isMine ? '#56b6a9' : '#f8faf9')};
`;

const UnreadMarker = styled.span`
  ${({ theme }) => theme.fonts.labelXS};
  position: absolute;
  left: -14px;
  bottom: 4px;
  color: ${({ theme }) => theme.colors.brand.dark};
`;

const ComposerWrap = styled.div`
  padding: 12px;
  background: ${({ theme }) => theme.colors.background.bg2};
  border-top: 1px solid ${({ theme }) => theme.colors.border.border1};
`;

const AssistantPanel = styled.aside`
  width: 320px;
  background: ${({ theme }) => theme.colors.background.bg1};
  display: flex;
  flex-direction: column;
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

const TypingDots = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;

  span {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.brand.primary};
    opacity: 0.8;
  }
`;

const RiskChip = styled.span`
  ${({ theme }) => theme.fonts.labelXS};
  border-radius: 999px;
  border: 1px solid #8fcbc2;
  background: #e9f7f4;
  color: #3e8d80;
  padding: 4px 10px;
`;
