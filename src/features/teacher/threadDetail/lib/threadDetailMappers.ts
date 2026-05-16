import { formatChatMessageDateTime } from '@/utils/formatDateTime';
import type {
  AnalysisResult,
  AnalyzeTeacherMessageResponse,
  ChatRoomMessageResponse,
  MessageItem,
  RecheckTeacherMessageResponse,
} from '@/features/teacher/threadDetail/types';

export const toMessageItem = (message: ChatRoomMessageResponse): MessageItem => {
  return {
    id: message.messageId,
    senderName: message.senderName || '-',
    sentAt: formatChatMessageDateTime(message.createdAt),
    content: message.content || '-',
    isMine: message.isMine,
    unreadCount: message.unreadCount ?? 0,
  };
};

export const toAnalysisResult = (
  response: AnalyzeTeacherMessageResponse | RecheckTeacherMessageResponse
): AnalysisResult => {
  if (!response.success || !response.data) {
    throw new Error(response.message || '메시지 분석에 실패했어요');
  }

  return {
    analysisId: response.data.analysisId,
    riskLevel: response.data.riskLevel,
    summary: response.message || '메시지 분석이 완료되었습니다.',
    recommendedReply: response.data.recommendedMessage?.trim() || null,
  };
};
