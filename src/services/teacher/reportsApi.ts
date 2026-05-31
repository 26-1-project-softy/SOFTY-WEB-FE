import { apiClient } from '@/services/http/apiClient';

export type ReportChatRoomItemResponse = {
  chatRoomId: number;
  parentName: string;
  studentName: string;
  intentType: string;
  intentLabel: string;
  status: string;
  lastMessageAt: string;
};

export type ReportChatRoomsResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: {
    items: ReportChatRoomItemResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
  } | null;
};

export type ReportChatRoomItem = {
  chatRoomId: number;
  parentName: string;
  studentName: string;
  intentType: string;
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
    pdfId: number;
    fileName: string;
    downloadUrl: string;
    expiresInSeconds: number;
  } | null;
};

export type CreateReportPdfResult =
  | {
      success: true;
      message: string;
      pdfId: number;
      fileName: string;
      downloadUrl: string;
      expiresInSeconds: number;
    }
  | {
      success: false;
      message: string;
    };

export type ReportChatPreviewMessageResponse = {
  messageId: number;
  isMine: boolean;
  content: string;
  createdAt: string;
};

export type ReportChatPreviewResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: {
    chatRoomId: number;
    messages: ReportChatPreviewMessageResponse[];
    nextCursor: number | null;
    hasNext: boolean;
  } | null;
};

export type ReportChatPreviewMessage = {
  messageId: number;
  isMine: boolean;
  content: string;
  createdAt: string;
};

export type ReportChatPreviewResult = {
  success: boolean;
  message: string;
  chatRoomId: number;
  messages: ReportChatPreviewMessage[];
  nextCursor: number | null;
  hasNext: boolean;
};

const ensureResponseData = <T>(payload: T | null | undefined, context: string): T => {
  if (!payload) {
    throw new Error(`${context}: data is missing`);
  }

  return payload;
};

export const reportsApi = {
  getReportChatRooms: async (params?: { page?: number; size?: number }) => {
    const { data } = await apiClient.get<ReportChatRoomsResponse>('/reports/chat-rooms', {
      params,
    });
    const payload = ensureResponseData(data.data, 'Report chat rooms response');

    return {
      success: data.success,
      message: data.message,
      data: payload.items,
      page: payload.page,
      size: payload.size,
      totalElements: payload.totalElements,
      totalPages: payload.totalPages,
      hasNext: payload.hasNext,
    } satisfies ReportChatRoomsResult;
  },
  createReportPdf: async (chatRoomId: number) => {
    const { data } = await apiClient.post<CreateReportPdfResponse>(
      `/reports/chat-rooms/${chatRoomId}/pdfs`
    );

    if (!data.success) {
      return {
        success: false,
        message: data.message,
      } satisfies CreateReportPdfResult;
    }

    const payload = ensureResponseData(data.data, 'Create report PDF response');

    return {
      success: true,
      message: data.message,
      pdfId: payload.pdfId,
      fileName: payload.fileName,
      downloadUrl: payload.downloadUrl,
      expiresInSeconds: payload.expiresInSeconds,
    } satisfies CreateReportPdfResult;
  },
  getReportChatRoomPreview: async (
    chatRoomId: number,
    params?: {
      cursor?: number;
      size?: number;
    }
  ) => {
    const requestParams: { size: number; cursor?: number } = {
      size: params?.size ?? 30,
    };

    if (params?.cursor != null) {
      requestParams.cursor = params.cursor;
    }

    const { data } = await apiClient.get<ReportChatPreviewResponse>(
      `/reports/chat-rooms/${chatRoomId}/preview`,
      {
        params: requestParams,
      }
    );
    const payload = ensureResponseData(data.data, 'Report chat preview response');

    return {
      success: data.success,
      message: data.message,
      chatRoomId: payload.chatRoomId,
      messages: payload.messages,
      nextCursor: payload.nextCursor,
      hasNext: payload.hasNext,
    } satisfies ReportChatPreviewResult;
  },
};
