import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate, useParams } from 'react-router-dom';
import { IconButton } from '@/components/common/IconButton';
import { InlineButton } from '@/components/common/InlineButton';
import { ChatComposer } from '@/components/common/chat/ChatComposer';
import { StatusTagButton, type StatusTagTone } from '@/components/common/chat/StatusTagButton';
import { ROUTES } from '@/constants/routes';
import { apiClient } from '@/services/http/apiClient';
import { IcBack, IcError, IcInfo, IcRefresh, IcSparkles } from '@/icons';

type ThreadStatus = 'processing' | 'done' | 'hold';
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

type RiskFeedbackPayload = {
  messageId: number;
  feedback: 'APPROPRIATE' | 'INAPPROPRIATE';
};

type RiskFeedbackResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: null;
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
  const [selectedFeedbackScore, setSelectedFeedbackScore] = useState<number | null>(null);
  const [isFeedbackSaved, setIsFeedbackSaved] = useState(false);
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const [feedbackErrorMessage, setFeedbackErrorMessage] = useState('');
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
      if (payload.status === 'DONE') {
        setStatus('done');
      } else if (payload.status === 'HOLD') {
        setStatus('hold');
      } else {
        setStatus('processing');
      }
      setLoadState('success');
    } catch {
      setLoadState('error');
      setDetailErrorMessage('대화 정보를 불러올 수 없어요');
    }
  }, [chatRoomId]);

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
  }, [loadChatRoomDetail, loadMessages]);

  const statusInfo = useMemo(() => {
    if (status === 'processing') {
      return {
        label: '처리중',
        tone: 'processing' as StatusTagTone,
      };
    }

    if (status === 'hold') {
      return {
        label: '보류',
        tone: 'hold' as StatusTagTone,
      };
    }

    return {
      label: '완료',
      tone: 'done' as StatusTagTone,
    };
  }, [status]);

  const feedbackTargetMessageId = useMemo(() => {
    if (analysisResult?.targetMessageId) {
      return analysisResult.targetMessageId;
    }

    const lastMyMessage = [...messages].reverse().find(message => message.isMine);
    return lastMyMessage?.id ?? messages[0]?.id ?? null;
  }, [analysisResult, messages]);

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

  const handleSelectFeedbackScore = async (score: number) => {
    if (!feedbackTargetMessageId || isFeedbackSubmitting) {
      return;
    }

    const feedbackValue: RiskFeedbackPayload['feedback'] =
      score >= 4 ? 'APPROPRIATE' : 'INAPPROPRIATE';

    try {
      setIsFeedbackSubmitting(true);
      setFeedbackErrorMessage('');

      await apiClient.post<RiskFeedbackResponse, unknown, RiskFeedbackPayload>(
        `/risk-feedback/${feedbackTargetMessageId}`,
        {
          messageId: feedbackTargetMessageId,
          feedback: feedbackValue,
        }
      );

      setSelectedFeedbackScore(score);
      setIsFeedbackSaved(true);
    } catch {
      setIsFeedbackSaved(false);
      setFeedbackErrorMessage('피드백 저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsFeedbackSubmitting(false);
    }
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
          <ParentName>{counterpartName || '-'}</ParentName>
          <StudentName>{studentName || '-'}</StudentName>
          <StatusTagButton label={intentLabel || '-'} tone="absence" />

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
                  variant="text"
                  size="M"
                  label="처리중"
                  onClick={() => {
                    setStatus('processing');
                    setIsStatusMenuOpen(false);
                  }}
                />
                <StatusMenuItem
                  variant="text"
                  size="M"
                  label="완료"
                  onClick={() => {
                    setStatus('done');
                    setIsStatusMenuOpen(false);
                  }}
                />
                <StatusMenuItem
                  variant="text"
                  size="M"
                  label="보류"
                  onClick={() => {
                    setStatus('hold');
                    setIsStatusMenuOpen(false);
                  }}
                />
              </StatusMenu>
            ) : null}
          </StatusDropdownWrap>
        </HeaderInfo>
      </ThreadHeader>

      <ThreadBody>
        <ConversationPanel>
          {loadState === 'error' ? (
            <DetailErrorBox>
              <DetailErrorIcon>
                <IcError />
              </DetailErrorIcon>
              <DetailErrorTitle>
                {detailErrorMessage || '대화 정보를 불러올 수 없어요'}
              </DetailErrorTitle>
              <DetailErrorDescription>잠시 후 다시 시도해주세요.</DetailErrorDescription>
              <DetailRetryButton
                variant="primary"
                size="L"
                icon={IcRefresh}
                label="다시 시도"
                onClick={() => void handleRetryConversation()}
              />
            </DetailErrorBox>
          ) : loadState === 'loading' ? (
            <DetailLoadingBox>채팅방 정보를 불러오는 중입니다.</DetailLoadingBox>
          ) : isMessagesLoading ? (
            <DetailLoadingBox>메시지를 불러오는 중입니다.</DetailLoadingBox>
          ) : messagesError ? (
            <DetailErrorBox>{messagesError}</DetailErrorBox>
          ) : (
            <MessageArea>
              {messagesPartialError ? (
                <PartialErrorBanner role="alert">
                  <PartialErrorLeft>
                    <PartialErrorIcon>
                      <IcInfo />
                    </PartialErrorIcon>
                    <PartialErrorTextWrap>
                      <PartialErrorTitle>채팅 내역을 불러오지 못했어요</PartialErrorTitle>
                      <PartialErrorDesc>
                        일부 데이터가 누락되었어요. 채팅 내역을 다시 불러와 주세요.
                      </PartialErrorDesc>
                    </PartialErrorTextWrap>
                  </PartialErrorLeft>

                  <InlineButton
                    variant="text"
                    size="M"
                    label="다시 시도"
                    onClick={handleRetryMissingMessages}
                  />
                </PartialErrorBanner>
              ) : null}

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

              <FeedbackTitle>분쟁 가능성 분석 결과가 얼마나 적절했나요?</FeedbackTitle>
              <ScoreButtonRow>
                {[1, 2, 3, 4, 5].map(score => (
                  <ScoreButton
                    key={score}
                    $isActive={selectedFeedbackScore === score}
                    variant={selectedFeedbackScore === score ? 'primary' : 'ghost'}
                    size="M"
                    width="40px"
                    label={String(score)}
                    onClick={() => void handleSelectFeedbackScore(score)}
                    disabled={isFeedbackSubmitting}
                  />
                ))}
              </ScoreButtonRow>
              <ScoreLabelRow>
                <span>매우 부적절</span>
                <span>매우 적절</span>
              </ScoreLabelRow>

              {isFeedbackSaved ? (
                <FeedbackSavedCard>
                  <FeedbackSavedTitle>의견이 반영되었어요</FeedbackSavedTitle>
                  <FeedbackSavedText>
                    보내주신 피드백은 분석 품질 개선에 활용돼요.
                  </FeedbackSavedText>
                </FeedbackSavedCard>
              ) : null}

              {feedbackErrorMessage ? (
                <FeedbackErrorText>{feedbackErrorMessage}</FeedbackErrorText>
              ) : null}

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

const StatusMenuItem = styled(InlineButton)`
  width: 100%;
  justify-content: flex-start;
  border-radius: 0;
  padding: 8px 10px;
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

const MessageArea = styled.div`
  flex: 1;
  min-height: 0;
  background: ${({ theme }) => theme.colors.reports.previewBackground};
  padding: 16px 14px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const DetailErrorBox = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: ${({ theme }) => theme.colors.reports.previewBackground};
`;

const DetailErrorIcon = styled.span`
  color: ${({ theme }) => theme.colors.semantic.error};

  svg {
    width: 28px;
    height: 28px;
  }
`;

const DetailErrorTitle = styled.p`
  ${({ theme }) => theme.fonts.labelM};
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const DetailErrorDescription = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const DetailRetryButton = styled(InlineButton)`
  margin-top: 14px;
`;

const DetailLoadingBox = styled(DetailErrorBox)`
  color: ${({ theme }) => theme.colors.text.text3};
`;

const LoadMoreWrap = styled.div`
  align-self: center;
`;

const PartialErrorBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border: 1px solid ${({ theme }) => theme.colors.intent.absenceLate.border};
  background: ${({ theme }) => theme.colors.intent.absenceLate.background};
  border-radius: 14px;
  padding: 10px 12px;
`;

const PartialErrorLeft = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
`;

const PartialErrorIcon = styled.span`
  color: ${({ theme }) => theme.colors.intent.absenceLate.text};
  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const PartialErrorTextWrap = styled.div`
  min-width: 0;
`;

const PartialErrorTitle = styled.p`
  ${({ theme }) => theme.fonts.labelXS};
  margin: 0;
  color: ${({ theme }) => theme.colors.intent.absenceLate.text};
`;

const PartialErrorDesc = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 4px 0 0;
  color: ${({ theme }) => theme.colors.intent.absenceLate.text};
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
  background: ${({ $isMine, theme }) =>
    $isMine ? theme.colors.brand.primary : theme.colors.background.bg1};
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
  border: 1px solid ${({ theme }) => theme.colors.reports.modalErrorBorder};
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
    $risk === 'high' ? theme.colors.reports.modalErrorBorder : theme.colors.border.border1};
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

const FeedbackTitle = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const ScoreButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ScoreButton = styled(InlineButton)<{ $isActive: boolean }>`
  border-radius: 8px;
  padding: 0;
  min-width: 40px;
`;

const ScoreLabelRow = styled.div`
  ${({ theme }) => theme.fonts.caption};
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.text.text4};
`;

const FeedbackSavedCard = styled.div`
  margin-top: 2px;
  border: 1px solid ${({ theme }) => theme.colors.threadStatus.processing.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.threadStatus.processing.background};
  padding: 10px 12px;
`;

const FeedbackSavedTitle = styled.p`
  ${({ theme }) => theme.fonts.labelXS};
  margin: 0;
  color: ${({ theme }) => theme.colors.threadStatus.processing.text};
`;

const FeedbackSavedText = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 4px 0 0;
  color: ${({ theme }) => theme.colors.threadStatus.processing.text};
`;

const FeedbackErrorText = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 0;
  color: ${({ theme }) => theme.colors.semantic.error};
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
