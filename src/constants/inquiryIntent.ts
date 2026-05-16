import type { ColorsType } from '@/styles/colors';

export const INQUIRY_INTENT = {
  ATTENDANCE: 'ATTENDANCE',
  COUNSELING: 'COUNSELING',
  REQUEST: 'REQUEST',
  INQUIRY: 'INQUIRY',
  ETC: 'ETC',
} as const;

export type InquiryIntentType = (typeof INQUIRY_INTENT)[keyof typeof INQUIRY_INTENT];

export const INQUIRY_INTENT_LABEL: Record<InquiryIntentType, string> = {
  ATTENDANCE: '출석',
  COUNSELING: '상담',
  REQUEST: '요청',
  INQUIRY: '문의',
  ETC: '기타',
};

export const INQUIRY_INTENT_COLOR_KEY: Record<InquiryIntentType, keyof ColorsType['intent']> = {
  ATTENDANCE: 'attendance',
  COUNSELING: 'counseling',
  REQUEST: 'request',
  INQUIRY: 'inquiry',
  ETC: 'etc',
};

export const getInquiryIntentByType = (intentType?: string | null): InquiryIntentType => {
  if (
    intentType === INQUIRY_INTENT.ATTENDANCE ||
    intentType === INQUIRY_INTENT.COUNSELING ||
    intentType === INQUIRY_INTENT.REQUEST ||
    intentType === INQUIRY_INTENT.INQUIRY ||
    intentType === INQUIRY_INTENT.ETC
  ) {
    return intentType;
  }

  return INQUIRY_INTENT.ETC;
};
