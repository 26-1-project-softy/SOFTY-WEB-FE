import type { InquiryIntentType } from '@/constants/inquiryIntent';
import type { InquiryStatusType } from '@/constants/inquiryStatus';

export type ThreadRoomItem = {
  id: number;
  counterpartName: string;
  studentName: string;
  preview: string;
  timeText: string;
  unreadCount: number;
  intentTag: {
    type: InquiryIntentType;
    label: string;
  };
  status: InquiryStatusType;
};
