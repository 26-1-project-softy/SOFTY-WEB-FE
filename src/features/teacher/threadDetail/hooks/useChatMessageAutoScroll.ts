import { useEffect, useRef } from 'react';
import type { DetailLoadState } from '@/features/teacher/threadDetail/types';
import { useScrollToLatestMessage } from '@/features/teacher/threadDetail/hooks/useScrollToLatestMessage';

type UseChatMessageAutoScrollParams = {
  loadState: DetailLoadState;
  isMessagesLoading: boolean;
  messageCount: number;
  scrollToLatestRequestKey: number;
};

export const useChatMessageAutoScroll = ({
  loadState,
  isMessagesLoading,
  messageCount,
  scrollToLatestRequestKey,
}: UseChatMessageAutoScrollParams) => {
  const { scrollContainerRef, scrollToLatestMessage } = useScrollToLatestMessage();

  const hasInitialScrolledRef = useRef(false);
  const previousScrollRequestKeyRef = useRef(scrollToLatestRequestKey);

  useEffect(() => {
    if (loadState !== 'success' || isMessagesLoading || messageCount === 0) {
      return;
    }

    if (hasInitialScrolledRef.current) {
      return;
    }

    hasInitialScrolledRef.current = true;
    scrollToLatestMessage('auto');
  }, [isMessagesLoading, loadState, messageCount, scrollToLatestMessage]);

  useEffect(() => {
    if (loadState !== 'success' || isMessagesLoading || messageCount === 0) {
      return;
    }

    if (previousScrollRequestKeyRef.current === scrollToLatestRequestKey) {
      return;
    }

    previousScrollRequestKeyRef.current = scrollToLatestRequestKey;
    scrollToLatestMessage('smooth');
  }, [isMessagesLoading, loadState, messageCount, scrollToLatestMessage, scrollToLatestRequestKey]);

  return {
    scrollContainerRef,
  };
};
