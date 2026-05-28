import { apiClient } from '@/services/http/apiClient';
import type { InquiryStatusType } from '@/constants/inquiryStatus';

export type ChatRoomResponse = {
  chatRoomId: number;
  counterpartName: string;
  studentName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: InquiryStatusType;
  intentLabel: string;
};

export type ChatRoomsResponse = {
  success: boolean;
  code: number;
  message: string;
  data: {
    content: ChatRoomResponse[];
    size: number;
    nextCursor: number | null;
    hasNext: boolean;
  };
};

type GetThreadRoomsParams = {
  cursor?: number;
  size: number;
};

export const threadListApi = {
  getThreadRooms: async ({ cursor, size }: GetThreadRoomsParams) => {
    const { data } = await apiClient.get<ChatRoomsResponse>('/chat-rooms', {
      params: {
        cursor,
        size,
      },
    });

    return data;
  },
};
