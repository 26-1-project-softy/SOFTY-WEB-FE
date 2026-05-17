import { RISK_ANALYSIS_DESCRIPTION, RISK_ANALYSIS_TITLE } from '@/constants/riskAnalysis';
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
    isUnreadByCounterpart: message.isUnreadByCounterpart,
  };
};

type AnalysisResponse = AnalyzeTeacherMessageResponse | RecheckTeacherMessageResponse;

export const toAnalysisResult = (response: AnalysisResponse): AnalysisResult => {
  const payload = response.data;

  if (!response.success || !payload) {
    throw new Error(response.message || '메시지 분석 결과를 불러올 수 없어요');
  }

  return {
    analysisId: payload.analysisId,
    riskLevel: payload.riskLevel,
    title: RISK_ANALYSIS_TITLE[payload.riskLevel],
    description: RISK_ANALYSIS_DESCRIPTION[payload.riskLevel],
    recommendedMessage: payload.recommendedMessage,
  };
};
