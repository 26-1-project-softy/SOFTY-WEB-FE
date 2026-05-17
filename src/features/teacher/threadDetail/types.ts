import type { ThreadStatus } from '@/stores/threadStatusStore';

export type DetailLoadState = 'loading' | 'error' | 'success';

export type AnalysisRiskLevel = 'SAFE' | 'UNSAFE';

export type ChatRoomDetailData = {
  chatRoomId: number;
  counterpartName: string;
  studentName: string;
  intentType?: string | null;
  status: ThreadStatus;
};

export type ChatRoomDetailResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: ChatRoomDetailData | null;
};

export type ChatRoomMessageResponse = {
  messageId: number;
  isMine: boolean;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
  isUnreadByCounterpart: boolean;
};

export type ChatRoomMessagesApiResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: {
    chatRoomId: number;
    messages: ChatRoomMessageResponse[];
    nextCursor: number | null;
    hasNext: boolean;
  } | null;
};

export type MarkMessagesReadResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: {
    chatRoomId: number;
    unreadCount: number;
    lastReadAt: string;
  } | null;
};

export type AnalyzeTeacherMessageResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: {
    analysisId: number;
    riskLevel: AnalysisRiskLevel;
    recommendedMessage: string | null;
  } | null;
};

export type RecheckTeacherMessageResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: {
    analysisId: number;
    riskLevel: AnalysisRiskLevel;
    recommendedMessage: string | null;
  } | null;
};

export type SendTeacherMessageRequest = {
  analysisId: number;
  content: string;
};

export type SendTeacherMessageResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: {
    messageId: number;
    roomId: number;
  } | null;
};

export type AnalysisFeedbackResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: Record<string, never> | null;
};

export type RecommendationAdoptionResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: Record<string, never> | null;
};

export type UpdateChatRoomStatusResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: {
    chatRoomId: number;
    status: ThreadStatus;
  } | null;
};

export type AnalysisResult = {
  analysisId: number;
  riskLevel: AnalysisRiskLevel;
  title: string;
  description: string;
  recommendedMessage?: string | null;
};

export type MessageItem = {
  id: number;
  senderName: string;
  sentAt: string;
  content: string;
  isMine: boolean;
  isUnreadByCounterpart: boolean;
};
