import styled from '@emotion/styled';
import { useChatMessageAutoScroll } from '@/features/teacher/threadDetail/hooks/useChatMessageAutoScroll';
import { Alert } from '@/components/common/Alert';
import { InlineButton } from '@/components/common/InlineButton';
import { Loader } from '@/components/common/Loader';
import { MessageBubbleList } from '@/components/common/MessageBubbleList';
import type { DetailLoadState, MessageItem } from '@/features/teacher/threadDetail/types';
import { IcError, IcRefresh } from '@/icons';

type ChatMessageListProps = {
  loadState: DetailLoadState;
  detailErrorMessage: string;
  isMessagesLoading: boolean;
  messagesError: string;
  messagesPartialError: string;
  messagesHasNext: boolean;
  isMessagesLoadingMore: boolean;
  messages: MessageItem[];
  scrollToLatestRequestKey: number;
  onRetryConversation: () => void;
  onRetryMissingMessages: () => void;
  onLoadMoreMessages: () => void;
  isChatCompleted?: boolean;
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
  scrollToLatestRequestKey,
  onRetryConversation,
  onRetryMissingMessages,
  onLoadMoreMessages,
  isChatCompleted,
}: ChatMessageListProps) => {
  const { scrollContainerRef } = useChatMessageAutoScroll({
    loadState,
    isMessagesLoading,
    messageCount: messages.length,
    scrollToLatestRequestKey,
  });

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
    <MessageArea ref={scrollContainerRef}>
      {isChatCompleted ? (
        <CompletedNoticeArea>
          <Alert
            variant="warning"
            title="문의 처리가 완료되었어요"
            description="이 채팅방에서는 더 이상 메시지를 보낼 수 없어요."
          />
        </CompletedNoticeArea>
      ) : null}

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

      <MessageBubbleList messages={messages} showUnreadMarker />
    </MessageArea>
  );
};

const MessageArea = styled.div`
  flex: 1;
  min-height: 0;
  padding: 12px 16px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const CompletedNoticeArea = styled.div`
  position: sticky;
  top: 0;
  z-index: 2;
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
