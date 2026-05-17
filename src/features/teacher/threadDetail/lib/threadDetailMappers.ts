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

const ANALYSIS_RESULT_TEXT: Record<
  AnalysisResult['riskLevel'],
  {
    title: string;
    description: string;
  }
> = {
  SAFE: {
    title: '문제 없는 메시지예요',
    description: '현재 메시지는 차분하고 명확해요. 그대로 보내셔도 괜찮아요.',
  },
  UNSAFE: {
    title: '오해가 발생할 수 있는 메시지예요',
    description:
      '메시지의 의도와 다르게 받아들여질 가능성이 있어요. 더 부드럽고 명확한 문장으로 바꿔보는 것을 추천드려요.',
  },
};

export const toAnalysisResult = (response: AnalysisResponse): AnalysisResult => {
  const payload = response.data;

  if (!response.success || !payload) {
    throw new Error(response.message || '메시지 분석 결과를 불러올 수 없어요');
  }

  const resultText = ANALYSIS_RESULT_TEXT[payload.riskLevel];

  return {
    analysisId: payload.analysisId,
    riskLevel: payload.riskLevel,
    title: resultText.title,
    description: resultText.description,
    recommendedMessage: payload.recommendedMessage,
  };
};
