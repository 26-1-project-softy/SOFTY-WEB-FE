import { formatMessagePreviewDateTime } from '@/utils/formatDateTime';
import { formatUserDisplayName } from '@/utils/formatUserDisplayName';
import { getInquiryIntentByType } from '@/constants/inquiryIntent';
import type { ChatRoomResponse } from '@/services/teacher/threadListApi';
import type { ThreadRoomItem } from '@/features/teacher/threadList/types';

export const toThreadRoomItem = (room: ChatRoomResponse): ThreadRoomItem => {
  return {
    id: room.chatRoomId,
    counterpartName: formatUserDisplayName(room.counterpartName),
    studentName: formatUserDisplayName(room.studentName),
    preview: room.lastMessage,
    timeText: formatMessagePreviewDateTime(room.lastMessageAt),
    unreadCount: room.unreadCount,
    intentTag: {
      type: getInquiryIntentByType(room.intentLabel),
      label: room.intentLabel,
    },
    status: room.status,
  };
};
