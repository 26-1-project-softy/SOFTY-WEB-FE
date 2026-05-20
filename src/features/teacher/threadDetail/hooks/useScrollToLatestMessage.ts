import { useCallback, useRef } from 'react';

export const useScrollToLatestMessage = () => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToLatestMessage = useCallback((behavior: ScrollBehavior = 'smooth') => {
    requestAnimationFrame(() => {
      const scrollContainer = scrollContainerRef.current;

      if (!scrollContainer) {
        return;
      }

      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior,
      });
    });
  }, []);

  return {
    scrollContainerRef,
    scrollToLatestMessage,
  };
};
