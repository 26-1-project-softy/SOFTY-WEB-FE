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

const INTENT_LABEL_TO_TYPE: Record<string, InquiryIntentType> = {
  출석: INQUIRY_INTENT.ATTENDANCE,
  출결: INQUIRY_INTENT.ATTENDANCE,
  상담: INQUIRY_INTENT.COUNSELING,
  요청: INQUIRY_INTENT.REQUEST,
  문의: INQUIRY_INTENT.INQUIRY,
  기타: INQUIRY_INTENT.ETC,
};

export const getInquiryIntentByType = (intentType?: string | null): InquiryIntentType => {
  const normalized = intentType?.trim();

  if (!normalized) {
    return INQUIRY_INTENT.ETC;
  }

  const upper = normalized.toUpperCase();

  if (
    upper === INQUIRY_INTENT.ATTENDANCE ||
    upper === INQUIRY_INTENT.COUNSELING ||
    upper === INQUIRY_INTENT.REQUEST ||
    upper === INQUIRY_INTENT.INQUIRY ||
    upper === INQUIRY_INTENT.ETC
  ) {
    return upper as InquiryIntentType;
  }

  const fromLabel = INTENT_LABEL_TO_TYPE[normalized];
  if (fromLabel) {
    return fromLabel;
  }

  return INQUIRY_INTENT.ETC;
};
