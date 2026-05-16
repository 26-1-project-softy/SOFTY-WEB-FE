import { useCallback } from 'react';
import { apiClient } from '@/services/http/apiClient';

type MarkMessagesReadResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: {
    chatRoomId: number;
    unreadCount: number;
    lastReadAt: string;
  } | null;
};

export const useChatRead = (chatRoomId: number) => {
  const markAsRead = useCallback(async () => {
    if (!Number.isFinite(chatRoomId) || chatRoomId <= 0) {
      return false;
    }

    await apiClient.post<MarkMessagesReadResponse>(`/chat-rooms/${chatRoomId}/read`);
    return true;
  }, [chatRoomId]);

  return { markAsRead };
};
