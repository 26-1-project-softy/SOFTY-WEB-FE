import { useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { threadDetailApi } from '@/services/teacher/threadDetailApi';
import { threadQueryKeys } from '@/constants/threadQueryKeys';
import { toMessageItem } from '@/features/teacher/threadDetail/lib';
import type { MessageItem } from '@/features/teacher/threadDetail/types';

const MESSAGE_PAGE_SIZE = 20;
const MESSAGE_FOCUS_REFETCH_STALE_TIME = 3000;
const MESSAGE_POLLING_INTERVAL_MS = 1000;

type ChatMessagesPage = {
  messages: MessageItem[];
  nextCursor: number | null;
  hasNext: boolean;
};

export const useChatMessagesQuery = (chatRoomId: number) => {
  const queryClient = useQueryClient();
  const isValidChatRoomId = Number.isFinite(chatRoomId) && chatRoomId > 0;
  const queryKey = threadQueryKeys.messages(chatRoomId);

  const query = useInfiniteQuery({
    queryKey,
    enabled: isValidChatRoomId,
    initialPageParam: undefined as number | undefined,
    queryFn: async ({ pageParam }) => {
      const response = await threadDetailApi.getMessages(chatRoomId, {
        cursor: pageParam,
        size: MESSAGE_PAGE_SIZE,
      });

      const payload = response.data;

      if (!payload) {
        throw new Error('메시지 데이터가 없습니다.');
      }

      return {
        messages: payload.messages.map(toMessageItem),
        nextCursor: payload.nextCursor,
        hasNext: payload.hasNext,
      };
    },
    getNextPageParam: lastPage => {
      if (!lastPage.hasNext) {
        return undefined;
      }

      return lastPage.nextCursor ?? undefined;
    },
    refetchOnWindowFocus: false,
    refetchInterval: () => {
      if (!isValidChatRoomId || typeof document === 'undefined') {
        return false;
      }

      return document.visibilityState === 'visible' ? MESSAGE_POLLING_INTERVAL_MS : false;
    },
    refetchIntervalInBackground: false,
    staleTime: MESSAGE_FOCUS_REFETCH_STALE_TIME,
  });

  const hasLoadedMessages = Boolean(query.data);
  const messages = query.data?.pages.flatMap(page => page.messages) ?? [];

  const appendOptimisticMessage = (message: MessageItem) => {
    queryClient.setQueryData<InfiniteData<ChatMessagesPage>>(queryKey, previousData => {
      if (!previousData) {
        return {
          pageParams: [undefined],
          pages: [
            {
              messages: [message],
              nextCursor: null,
              hasNext: false,
            },
          ],
        };
      }

      const lastPageIndex = previousData.pages.length - 1;

      return {
        ...previousData,
        pages: previousData.pages.map((page, index) => {
          if (index !== lastPageIndex) {
            return page;
          }

          return {
            ...page,
            messages: [...page.messages, message],
          };
        }),
      };
    });
  };

  return {
    messages,
    isMessagesLoading: query.isLoading && !hasLoadedMessages,
    isMessagesFetching: query.isFetching && hasLoadedMessages,
    isMessagesLoadingMore: query.isFetchingNextPage,
    messagesError: query.isError && !hasLoadedMessages ? '메시지를 불러올 수 없어요.' : '',
    messagesPartialError:
      query.isError && hasLoadedMessages ? '채팅 내역을 최신 상태로 갱신하지 못했어요.' : '',
    messagesHasNext: Boolean(query.hasNextPage),
    fetchNextMessagesPage: query.fetchNextPage,
    refetchMessages: query.refetch,
    appendOptimisticMessage,
  };
};
