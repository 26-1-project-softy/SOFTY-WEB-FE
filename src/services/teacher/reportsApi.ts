import { apiClient } from '@/services/http/apiClient';

export type ReportChatRoomItemResponse = {
  chatRoomId?: number;
  parentName?: string | null;
  studentName?: string | null;
  intentLabel?: string | null;
  status?: string | null;
  lastMessageAt?: string | null;
};

export type ReportChatRoomsResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: {
    items?: ReportChatRoomItemResponse[] | null;
    page?: number;
    size?: number;
    totalElements?: number;
    totalPages?: number;
    hasNext?: boolean;
  } | null;
};

export type ReportChatRoomItem = {
  chatRoomId: number;
  parentName: string;
  studentName: string;
  intentLabel: string;
  status: string;
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

export type CreateReportPdfResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: {
    pdfId?: number;
    fileName?: string | null;
    downloadUrl?: string | null;
    expiresInSeconds?: number;
  } | null;
};

export type CreateReportPdfResult = {
  success: boolean;
  message: string;
  pdfId: number | null;
  fileName: string;
  downloadUrl: string;
  expiresInSeconds: number | null;
};

export const reportsApi = {
  getReportChatRooms: async (params?: { page?: number; size?: number }) => {
    const { data } = await apiClient.get<ReportChatRoomsResponse>('/reports/chat-rooms', {
      params,
    });
    const payload = data.data;
    const items = payload?.items;

    return {
      success: data.success,
      message: data.message,
      data: Array.isArray(items)
        ? items.map(item => ({
            chatRoomId: item.chatRoomId ?? 0,
            parentName: item.parentName ?? '',
            studentName: item.studentName ?? '',
            intentLabel: item.intentLabel ?? '',
            status: item.status ?? '',
            lastMessageAt: item.lastMessageAt ?? '',
          }))
        : [],
      page: payload?.page ?? 0,
      size: payload?.size ?? 0,
      totalElements: payload?.totalElements ?? 0,
      totalPages: payload?.totalPages ?? 0,
      hasNext: payload?.hasNext ?? false,
    } satisfies ReportChatRoomsResult;
  },
  createReportPdf: async (chatRoomId: number) => {
    const { data } = await apiClient.post<CreateReportPdfResponse>(
      `/reports/chat-rooms/${chatRoomId}/pdfs`
    );

    return {
      success: data.success,
      message: data.message,
      pdfId: data.data?.pdfId ?? null,
      fileName: data.data?.fileName ?? '',
      downloadUrl: data.data?.downloadUrl ?? '',
      expiresInSeconds: data.data?.expiresInSeconds ?? null,
    } satisfies CreateReportPdfResult;
  },
};
