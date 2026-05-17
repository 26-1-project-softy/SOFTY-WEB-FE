import { useEffect, useRef } from 'react';

type UseRefreshChatMessagesOnFocusParams = {
  enabled: boolean;
  throttleMs: number;
  onRefresh: () => void;
};

export const useRefreshChatMessagesOnFocus = ({
  enabled,
  throttleMs,
  onRefresh,
}: UseRefreshChatMessagesOnFocusParams) => {
  const lastFocusedRefreshAtRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const refreshMessagesOnFocus = () => {
      const now = Date.now();

      if (now - lastFocusedRefreshAtRef.current < throttleMs) {
        return;
      }

      lastFocusedRefreshAtRef.current = now;
      onRefresh();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshMessagesOnFocus();
      }
    };

    window.addEventListener('focus', refreshMessagesOnFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', refreshMessagesOnFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, onRefresh, throttleMs]);
};
