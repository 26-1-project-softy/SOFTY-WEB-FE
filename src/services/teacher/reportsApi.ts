import { apiClient } from '@/services/http/apiClient';

export type ReportChatRoomItemResponse = {
  chatRoomId?: number;
  parentName?: string | null;
  studentName?: string | null;
  intentLabel?: string | null;
  lastMessageAt?: string | null;
};

export type ReportChatRoomsResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: ReportChatRoomItemResponse[] | null;
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  hasNext?: boolean;
};

export type ReportChatRoomItem = {
  chatRoomId: number;
  parentName: string;
  studentName: string;
  intentLabel: string;
  lastMessageAt: string;
};

export type ReportChatRoomsResult = {
  success: boolean;
  message: string;
  data: ReportChatRoomItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

export const reportsApi = {
  getReportChatRooms: async (params?: { page?: number; size?: number }) => {
    const { data } = await apiClient.get<ReportChatRoomsResponse>('/reports/chat-rooms', {
      params,
    });

    return {
      success: data.success,
      message: data.message,
      data: Array.isArray(data.data)
        ? data.data.map(item => ({
            chatRoomId: item.chatRoomId ?? 0,
            parentName: item.parentName ?? '',
            studentName: item.studentName ?? '',
            intentLabel: item.intentLabel ?? '',
            lastMessageAt: item.lastMessageAt ?? '',
          }))
        : [],
      page: data.page ?? 0,
      size: data.size ?? 0,
      totalElements: data.totalElements ?? 0,
      totalPages: data.totalPages ?? 0,
      hasNext: data.hasNext ?? false,
    } satisfies ReportChatRoomsResult;
  },
};
