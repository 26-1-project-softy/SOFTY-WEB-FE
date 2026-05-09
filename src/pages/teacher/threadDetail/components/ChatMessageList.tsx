import styled from '@emotion/styled';
import { InlineButton } from '@/components/common/InlineButton';
import { IcError, IcInfo, IcRefresh } from '@/icons';

type DetailLoadState = 'loading' | 'error' | 'success';

type MessageItem = {
  id: number;
  senderName: string;
  sentAt: string;
  content: string;
  isMine: boolean;
  unreadCount?: number;
};

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
        <DetailErrorTitle>{detailErrorMessage || '��ȭ ������ �ҷ��� �� �����'}</DetailErrorTitle>
        <DetailErrorDescription>��� �� �ٽ� �õ����ּ���.</DetailErrorDescription>
        <DetailRetryButton
          variant="primary"
          size="L"
          icon={IcRefresh}
          label="�ٽ� �õ�"
          onClick={onRetryConversation}
        />
      </DetailErrorBox>
    );
  }

  if (loadState === 'loading') {
    return <DetailLoadingBox>ä�ù� ������ �ҷ����� ���Դϴ�.</DetailLoadingBox>;
  }

  if (isMessagesLoading) {
    return <DetailLoadingBox>�޽����� �ҷ����� ���Դϴ�.</DetailLoadingBox>;
  }

  if (messagesError) {
    return <DetailErrorBox>{messagesError}</DetailErrorBox>;
  }

  return (
    <MessageArea>
      {messagesPartialError ? (
        <PartialErrorBanner role="alert">
          <PartialErrorLeft>
            <PartialErrorIcon>
              <IcInfo />
            </PartialErrorIcon>
            <PartialErrorTextWrap>
              <PartialErrorTitle>ä�� ������ �ҷ����� ���߾��</PartialErrorTitle>
              <PartialErrorDesc>
                �Ϻ� �����Ͱ� �����Ǿ����. ä�� ������ �ٽ� �ҷ��� �ּ���.
              </PartialErrorDesc>
            </PartialErrorTextWrap>
          </PartialErrorLeft>
          <InlineButton variant="text" size="M" label="�ٽ� �õ�" onClick={onRetryMissingMessages} />
        </PartialErrorBanner>
      ) : null}

      {messagesHasNext ? (
        <LoadMoreWrap>
          <InlineButton
            variant="ghost"
            size="M"
            label={isMessagesLoadingMore ? '�ҷ����� ��...' : '���� �޽��� ������'}
            onClick={onLoadMoreMessages}
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
