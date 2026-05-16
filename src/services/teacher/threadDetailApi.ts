import { apiClient } from '@/services/http/apiClient';
import type { ThreadStatus } from '@/stores/threadStatusStore';
import type {
  AnalysisFeedbackResponse,
  AnalyzeTeacherMessageResponse,
  ChatRoomDetailResponse,
  ChatRoomMessagesApiResponse,
  MarkMessagesReadResponse,
  RecheckTeacherMessageResponse,
  RecommendationAdoptionResponse,
  SendTeacherMessageRequest,
  SendTeacherMessageResponse,
  UpdateChatRoomStatusResponse,
} from '@/features/teacher/threadDetail/types';

type GetMessagesParams = {
  cursor?: number;
  size?: number;
};

export const threadDetailApi = {
  getChatRoomDetail: async (chatRoomId: number) => {
    const { data } = await apiClient.get<ChatRoomDetailResponse>(`/chat-rooms/${chatRoomId}`);

    return data;
  },

  getMessages: async (chatRoomId: number, params: GetMessagesParams = {}) => {
    const { data } = await apiClient.get<ChatRoomMessagesApiResponse>(
      `/chat-rooms/${chatRoomId}/messages`,
      {
        params: {
          size: params.size ?? 20,
          ...(params.cursor != null ? { cursor: params.cursor } : {}),
        },
      }
    );

    return data;
  },

  readRoom: async (chatRoomId: number) => {
    const { data } = await apiClient.post<MarkMessagesReadResponse>(
      `/chat-rooms/${chatRoomId}/read`
    );

    return data;
  },

  analyzeMessage: async (chatRoomId: number, content: string) => {
    const { data } = await apiClient.post<AnalyzeTeacherMessageResponse>(
      `/chat-rooms/${chatRoomId}/teacher-messages/analyze`,
      {
        content,
      }
    );

    return data;
  },

  recheckMessage: async (analysisId: number, content: string) => {
    const { data } = await apiClient.post<RecheckTeacherMessageResponse>(
      `/teacher-message-analyses/${analysisId}/recheck`,
      {
        content,
      }
    );

    return data;
  },

  sendMessage: async (chatRoomId: number, payload: SendTeacherMessageRequest) => {
    const { data } = await apiClient.post<SendTeacherMessageResponse>(
      `/chat-rooms/${chatRoomId}/teacher-messages`,
      payload
    );

    return data;
  },

  saveRecommendationAdoption: async (analysisId: number) => {
    const { data } = await apiClient.post<RecommendationAdoptionResponse>(
      `/teacher-message-analyses/${analysisId}/recommendation-adoption`,
      {
        analysisId,
      }
    );

    return data;
  },

  saveAnalysisFeedback: async (analysisId: number, score: number) => {
    const { data } = await apiClient.put<AnalysisFeedbackResponse>(
      `/teacher-message-analyses/${analysisId}/feedback`,
      {
        score,
      }
    );

    return data;
  },

  updateStatus: async (chatRoomId: number, status: ThreadStatus) => {
    const { data } = await apiClient.patch<UpdateChatRoomStatusResponse>(
      `/chat-rooms/${chatRoomId}/status`,
      {
        status,
      }
    );

    return data;
  },
};
