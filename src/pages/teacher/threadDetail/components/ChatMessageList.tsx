import styled from '@emotion/styled';
import { Alert } from '@/components/common/Alert';
import { InlineButton } from '@/components/common/InlineButton';
import { Loader } from '@/components/common/Loader';
import { Avatar } from '@/components/common/Avatar';
import type { MessageItem } from '@/features/teacher/threadDetail/types';
import { IcError, IcRefresh } from '@/icons';

type DetailLoadState = 'loading' | 'error' | 'success';

type ChatMessageListProps = {
  loadState: DetailLoadState;
  detailErrorMessage: string;
  isMessagesLoading: boolean;
  messagesError: string;
  messagesPartialError: string;
  messagesHasNext: boolean;
  isMessagesLoadingMore: boolean;
  messages: MessageItem[];
  onRetryConversation: () => void;
  onRetryMissingMessages: () => void;
  onLoadMoreMessages: () => void;
};

export const ChatMessageList = ({
  loadState,
  detailErrorMessage,
  isMessagesLoading,
  messagesError,
  messagesPartialError,
  messagesHasNext,
  isMessagesLoadingMore,
  messages,
  onRetryConversation,
  onRetryMissingMessages,
  onLoadMoreMessages,
}: ChatMessageListProps) => {
  if (loadState === 'error') {
    return (
      <DetailErrorBox>
        <DetailErrorIcon>
          <IcError />
        </DetailErrorIcon>
        <DetailErrorTitle>{detailErrorMessage || '대화 목록을 불러올 수 없어요'}</DetailErrorTitle>
        <DetailErrorDescription>잠시 후 다시 시도해주세요.</DetailErrorDescription>
        <DetailRetryButton
          variant="primary"
          size="L"
          icon={IcRefresh}
          label="다시 시도"
          onClick={onRetryConversation}
        />
      </DetailErrorBox>
    );
  }

  if (loadState === 'loading') {
    return (
      <DetailLoadingBox>
        <Loader />
      </DetailLoadingBox>
    );
  }

  if (isMessagesLoading) {
    return (
      <DetailLoadingBox>
        <Loader />
      </DetailLoadingBox>
    );
  }

  if (messagesError) {
    return <DetailErrorBox>{messagesError}</DetailErrorBox>;
  }

  return (
    <MessageArea>
      {messagesPartialError ? (
        <Alert
          title="채팅 내역을 불러오지 못했어요"
          description="일부 데이터가 누락되었어요. 채팅 내역을 다시 불러와 주세요."
          variant="warning"
          onRetry={onRetryMissingMessages}
        />
      ) : null}

      {messagesHasNext ? (
        <LoadMoreWrap>
          <InlineButton
            variant="ghost"
            size="M"
            label={isMessagesLoadingMore ? '불러오는 중...' : '이전 메시지 더보기'}
            onClick={onLoadMoreMessages}
            disabled={isMessagesLoadingMore}
          />
        </LoadMoreWrap>
      ) : null}

      {messages.map(message => (
        <MessageItem key={message.id} $isMine={message.isMine}>
          {!message.isMine && (
            <CounterpartInfo>
              <Avatar lastName={message.senderName.charAt(0)} />
              <SenderName>{message.senderName}</SenderName>
            </CounterpartInfo>
          )}

          <BubbleWrap $isMine={message.isMine}>
            {message.isMine && message.isUnreadByCounterpart && <UnreadMarker>1</UnreadMarker>}
            <MessageBubble $isMine={message.isMine}>{message.content}</MessageBubble>
          </BubbleWrap>

          <MessageTime $isMine={message.isMine}>{message.sentAt}</MessageTime>
        </MessageItem>
      ))}
    </MessageArea>
  );
};

const MessageArea = styled.div`
  flex: 1;
  min-height: 0;
  background: ${({ theme }) => theme.colors.background.bg4};
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
  background: ${({ theme }) => theme.colors.background.bg4};
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

const MessageItem = styled.article<{ $isMine: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isMine }) => ($isMine ? 'flex-end' : 'flex-start')};
  gap: 8px;
`;

const CounterpartInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SenderName = styled.span`
  ${({ theme }) => theme.fonts.labelXS};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const MessageTime = styled.span<{ $isMine: boolean }>`
  text-align: ${({ $isMine }) => ($isMine ? 'flex-end' : 'flex-start')};
  ${({ theme }) => theme.fonts.caption};
  color: ${({ theme }) => theme.colors.text.text4};
`;

const BubbleWrap = styled.div<{ $isMine: boolean }>`
  display: flex;
  align-items: flex-end;
  justify-content: ${({ $isMine }) => ($isMine ? 'flex-end' : 'flex-start')};
  max-width: min(72%, 540px);
  gap: 8px;
`;

const UnreadMarker = styled.span`
  ${({ theme }) => theme.fonts.caption};
  color: ${({ theme }) => theme.colors.brand.primary};
`;

const MessageBubble = styled.div<{ $isMine: boolean }>`
  ${({ theme }) => theme.fonts.body2};
  border-radius: ${({ $isMine }) => ($isMine ? '20px 0' : '0 20px')} 20px 20px;
  padding: 12px 16px;
  line-height: 1.45;
  color: ${({ $isMine, theme }) => ($isMine ? theme.colors.text.textW : theme.colors.text.text2)};
  background: ${({ $isMine, theme }) =>
    $isMine ? theme.colors.brand.primary : theme.colors.background.bg1};
`;
